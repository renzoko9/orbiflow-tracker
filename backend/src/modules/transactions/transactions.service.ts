import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { Account, Transaction } from '@Entities';
import { AccountRepository, TransactionRepository } from '@Repositories';
import { CreateTransactionRequest } from './dto/create-transaction.dto';
import { UpdateTransactionRequest } from './dto/update-transaction.dto';
import { CreateTransferRequest } from './dto/create-transfer.dto';
import { UpdateTransferRequest } from './dto/update-transfer.dto';
import {
  FilterTransactionsQuery,
  TransactionKindFilter,
} from './dto/filter-transactions.dto';
import { TransactionTypeEnum, ErrorCodeEnum, ResponseTypeEnum } from '@Enums';
import { ResponseAPI } from '@/common/interfaces/response.interface';
import {
  TransactionDetailResponse,
  TransactionListResponse,
  TransactionResponse,
  TransferDetailResponse,
  AccountMovementListResponse,
} from './models/transaction-response.model';
import { TransactionsMapper } from './transactions.mapper';

interface TransferLegs {
  source: Transaction;
  destination: Transaction;
}

interface PhotosUpdateCommand {
  retain: string[];
  added: string[];
}

const TRANSACTION_UPLOAD_PREFIX = '/uploads/transactions/';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionsMapper: TransactionsMapper,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: number,
    createTransactionRequest: CreateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
    this.logger.log(`Creando transacción para usuario ${userId}`);

    const uploadedPhotos = createTransactionRequest.photos ?? [];
    if (uploadedPhotos.length > 5) {
      await this.cleanupUploadedPhotos(uploadedPhotos);
      throw new BadRequestException({
        message: 'No se pueden adjuntar mas de 5 fotos por movimiento',
      });
    }

    try {
      const account = await this.accountRepository.findOne({
        where: { id: createTransactionRequest.accountId, user: { id: userId } },
      });

      if (!account) {
        throw new NotFoundException({
          message: `Account with id ${createTransactionRequest.accountId} not found`,
          errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
        });
      }

      if (account.archivedAt !== null) {
        throw new BadRequestException({
          message: 'No se pueden registrar movimientos en una cuenta archivada',
          errorCode: ErrorCodeEnum.ACCOUNT_ARCHIVED,
        });
      }

      const newTransaction = this.transactionRepository.create({
        amount: createTransactionRequest.amount,
        description: createTransactionRequest.description,
        type: createTransactionRequest.type,
        date: createTransactionRequest.date.split('T')[0] as unknown as Date,
        user: { id: userId },
        account: { id: createTransactionRequest.accountId },
        category: { id: createTransactionRequest.categoryId },
        photos: uploadedPhotos,
      });

      const savedTransaction =
        await this.transactionRepository.save(newTransaction);

      await this.updateAccountBalance(
        createTransactionRequest.accountId,
        createTransactionRequest.amount,
        createTransactionRequest.type,
      );

      const full = await this.transactionRepository.findOne({
        where: { id: savedTransaction.id },
        relations: ['category', 'account'],
      });

      this.logger.log(`Transacción ${savedTransaction.id} creada exitosamente`);

      return {
        responseType: ResponseTypeEnum.Success,
        title: 'Transacción registrada',
        message: 'El movimiento se guardó correctamente',
        data: this.transactionsMapper.toResponse(full!),
      };
    } catch (err) {
      await this.cleanupUploadedPhotos(uploadedPhotos);
      throw err;
    }
  }

  async findAll(
    userId: number,
    filters: FilterTransactionsQuery = {},
  ): Promise<TransactionListResponse[]> {
    this.logger.log(
      `Listando transacciones para usuario ${userId} | Filtros: ${JSON.stringify(filters)}`,
    );

    const where: FindOptionsWhere<Transaction>[] = [];
    const onlyTransfers = filters.kind === TransactionKindFilter.Transfer;

    const baseWhere: FindOptionsWhere<Transaction> = {
      user: { id: userId },
      account: { archivedAt: IsNull() },
      ...(!onlyTransfers && filters.type && { type: filters.type }),
      ...(!onlyTransfers &&
        filters.categoryId && { category: { id: filters.categoryId } }),
      ...(filters.dateFrom && {
        date: MoreThanOrEqual(new Date(filters.dateFrom)),
      }),
      ...(filters.dateTo && {
        date: LessThanOrEqual(new Date(filters.dateTo)),
      }),
    };

    if (onlyTransfers) {
      baseWhere.transferGroupId = Not(IsNull());
    } else if (filters.type || filters.categoryId) {
      // Si se filtra por type o categoryId, las transferencias quedan fuera:
      // no son ni income ni expense contables y no tienen categoria.
      baseWhere.transferGroupId = IsNull();
    }

    if (filters.dateFrom && filters.dateTo) {
      baseWhere.date = MoreThanOrEqual(new Date(filters.dateFrom));
    }

    if (filters.search) {
      where.push(
        { ...baseWhere, description: ILike(`%${filters.search}%`) },
        {
          ...baseWhere,
          category: {
            ...((baseWhere.category as object) || {}),
            name: ILike(`%${filters.search}%`),
          },
        },
      );
    } else {
      where.push(baseWhere);
    }

    const rawLimit = filters.limit;
    // Sobre-traer cuando hay limit porque las transferencias colapsan 2 -> 1.
    const fetchLimit = rawLimit ? rawLimit * 2 : undefined;

    const transactions = await this.transactionRepository.find({
      where,
      relations: ['category', 'account'],
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
      take: fetchLimit,
    });

    const dateFiltered =
      filters.dateFrom && filters.dateTo
        ? transactions.filter((tx) => {
            const txDate =
              tx.date instanceof Date
                ? tx.date.toISOString().split('T')[0]
                : String(tx.date);
            return txDate <= filters.dateTo!;
          })
        : transactions;

    const collapsed = this.collapseListForGlobal(dateFiltered);
    const sliced = rawLimit ? collapsed.slice(0, rawLimit) : collapsed;

    this.logger.log(`Se devolvieron ${sliced.length} entradas`);

    return sliced;
  }

  async findByAccount(
    accountId: number,
    userId: number,
  ): Promise<AccountMovementListResponse[]> {
    this.logger.log(
      `Listando transacciones de cuenta ${accountId} para usuario ${userId}`,
    );

    const account = await this.accountRepository.findOne({
      where: { id: accountId, user: { id: userId } },
    });

    if (!account) {
      throw new NotFoundException({
        message: `Account with id ${accountId} not found`,
        errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
      });
    }

    const transactions = await this.transactionRepository.find({
      where: { account: { id: accountId }, user: { id: userId } },
      relations: ['category', 'account'],
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
    });

    const counterpartyByGroup = await this.loadCounterpartyAccounts(
      transactions,
      accountId,
    );

    return transactions.map((tx) =>
      this.transactionsMapper.toAccountMovementListResponse(
        tx,
        tx.transferGroupId
          ? (counterpartyByGroup.get(tx.transferGroupId) ?? null)
          : null,
      ),
    );
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<TransactionDetailResponse> {
    this.logger.log(`Buscando transacción ${id} para usuario ${userId}`);

    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'account'],
    });

    if (!transaction) {
      throw new NotFoundException({
        message: `Transaction with id ${id} not found`,
        errorCode: ErrorCodeEnum.TRANSACTION_NOT_FOUND,
      });
    }

    return this.transactionsMapper.toDetailResponse(transaction);
  }

  async update(
    id: number,
    userId: number,
    updateTransactionDto: Omit<UpdateTransactionRequest, 'existingPhotos'>,
    photosCmd?: PhotosUpdateCommand,
  ): Promise<ResponseAPI<TransactionResponse>> {
    this.logger.log(`Actualizando transacción ${id} para usuario ${userId}`);

    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'account', 'user'],
    });

    if (!transaction) {
      if (photosCmd) await this.cleanupUploadedPhotos(photosCmd.added);
      throw new NotFoundException({
        message: `Transaction with id ${id} not found`,
        errorCode: ErrorCodeEnum.TRANSACTION_NOT_FOUND,
      });
    }

    if (transaction.user.id !== userId) {
      if (photosCmd) await this.cleanupUploadedPhotos(photosCmd.added);
      throw new ForbiddenException({
        message: 'You can only update your own transactions',
        errorCode: ErrorCodeEnum.FORBIDDEN_RESOURCE,
      });
    }

    if (transaction.transferGroupId !== null) {
      if (photosCmd) await this.cleanupUploadedPhotos(photosCmd.added);
      throw new BadRequestException({
        message:
          'Esta transaccion forma parte de una transferencia. Usa /transactions/transfer/:groupId.',
        errorCode: ErrorCodeEnum.TRANSFER_USE_TRANSFER_ENDPOINT,
      });
    }

    let nextPhotos: string[] | undefined;
    let photosToRemove: string[] = [];
    if (photosCmd) {
      const currentSet = new Set(transaction.photos);
      for (const url of photosCmd.retain) {
        if (!currentSet.has(url)) {
          await this.cleanupUploadedPhotos(photosCmd.added);
          throw new BadRequestException({
            message:
              'Una de las fotos referenciadas no pertenece a este movimiento',
          });
        }
      }
      if (photosCmd.retain.length + photosCmd.added.length > 5) {
        await this.cleanupUploadedPhotos(photosCmd.added);
        throw new BadRequestException({
          message: 'No se pueden adjuntar mas de 5 fotos por movimiento',
        });
      }
      nextPhotos = [...photosCmd.retain, ...photosCmd.added];
      const finalSet = new Set(nextPhotos);
      photosToRemove = transaction.photos.filter((url) => !finalSet.has(url));
    }

    if (
      updateTransactionDto.accountId &&
      updateTransactionDto.accountId !== transaction.account.id
    ) {
      const newAccount = await this.accountRepository.findOne({
        where: { id: updateTransactionDto.accountId, user: { id: userId } },
      });

      if (!newAccount) {
        throw new NotFoundException({
          message: `Account with id ${updateTransactionDto.accountId} not found`,
          errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
        });
      }

      if (newAccount.archivedAt !== null) {
        throw new BadRequestException({
          message: 'No se puede mover el movimiento a una cuenta archivada',
          errorCode: ErrorCodeEnum.ACCOUNT_ARCHIVED,
        });
      }

      await this.updateAccountBalance(
        transaction.account.id,
        transaction.amount,
        transaction.type,
        true,
      );

      await this.updateAccountBalance(
        updateTransactionDto.accountId,
        updateTransactionDto.amount ?? transaction.amount,
        updateTransactionDto.type ?? transaction.type,
      );
    } else if (
      updateTransactionDto.amount !== undefined ||
      updateTransactionDto.type !== undefined
    ) {
      await this.updateAccountBalance(
        transaction.account.id,
        transaction.amount,
        transaction.type,
        true,
      );

      await this.updateAccountBalance(
        transaction.account.id,
        updateTransactionDto.amount ?? transaction.amount,
        updateTransactionDto.type ?? transaction.type,
      );
    }

    Object.assign(transaction, {
      ...updateTransactionDto,
      date: updateTransactionDto.date
        ? (updateTransactionDto.date.split('T')[0] as unknown as Date)
        : transaction.date,
      category: updateTransactionDto.categoryId
        ? { id: updateTransactionDto.categoryId }
        : transaction.category,
      account: updateTransactionDto.accountId
        ? { id: updateTransactionDto.accountId }
        : transaction.account,
      ...(nextPhotos !== undefined && { photos: nextPhotos }),
    });

    await this.transactionRepository.save(transaction);

    if (photosToRemove.length > 0) {
      await this.cleanupUploadedPhotos(photosToRemove);
    }

    this.logger.log(`Transacción ${id} actualizada exitosamente`);

    const updated = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'account'],
    });

    return {
      responseType: ResponseTypeEnum.Success,
      title: 'Transacción actualizada',
      message: 'El movimiento se actualizó correctamente',
      data: this.transactionsMapper.toResponse(updated!),
    };
  }

  async delete(id: number, userId: number): Promise<void> {
    this.logger.log(`Eliminando transacción ${id} para usuario ${userId}`);

    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'account', 'user'],
    });

    if (!transaction) {
      throw new NotFoundException({
        message: `Transaction with id ${id} not found`,
        errorCode: ErrorCodeEnum.TRANSACTION_NOT_FOUND,
      });
    }

    if (transaction.user.id !== userId) {
      throw new ForbiddenException({
        message: 'You can only delete your own transactions',
        errorCode: ErrorCodeEnum.FORBIDDEN_RESOURCE,
      });
    }

    if (transaction.transferGroupId !== null) {
      throw new BadRequestException({
        message:
          'Esta transaccion forma parte de una transferencia. Usa /transactions/transfer/:groupId.',
        errorCode: ErrorCodeEnum.TRANSFER_USE_TRANSFER_ENDPOINT,
      });
    }

    await this.updateAccountBalance(
      transaction.account.id,
      Number(transaction.amount),
      transaction.type,
      true,
    );

    const photosToRemove = [...transaction.photos];
    await this.transactionRepository.remove(transaction);
    await this.cleanupUploadedPhotos(photosToRemove);

    this.logger.log(`Transacción ${id} eliminada exitosamente`);
  }

  async createTransfer(
    userId: number,
    dto: CreateTransferRequest,
  ): Promise<ResponseAPI<TransferDetailResponse>> {
    this.logger.log(
      `Creando transferencia ${dto.sourceAccountId} -> ${dto.destinationAccountId} para usuario ${userId}`,
    );

    if (dto.sourceAccountId === dto.destinationAccountId) {
      throw new BadRequestException({
        message: 'La cuenta origen y destino deben ser distintas',
        errorCode: ErrorCodeEnum.TRANSFER_SAME_ACCOUNT,
      });
    }

    const groupId = randomUUID();
    const dateOnly = dto.date.split('T')[0] as unknown as Date;

    const pair = await this.dataSource.transaction(async (manager) => {
      const accounts = await this.loadUsableAccounts(manager, userId, [
        dto.sourceAccountId,
        dto.destinationAccountId,
      ]);
      const sourceAccount = accounts.get(dto.sourceAccountId)!;
      const destinationAccount = accounts.get(dto.destinationAccountId)!;

      const sourceLeg = manager.create(Transaction, {
        amount: dto.amount,
        description: dto.description,
        type: TransactionTypeEnum.Expense,
        date: dateOnly,
        user: { id: userId },
        account: { id: sourceAccount.id },
        transferGroupId: groupId,
      });
      const destinationLeg = manager.create(Transaction, {
        amount: dto.amount,
        description: dto.description,
        type: TransactionTypeEnum.Income,
        date: dateOnly,
        user: { id: userId },
        account: { id: destinationAccount.id },
        transferGroupId: groupId,
      });

      const savedSource = await manager.save(Transaction, sourceLeg);
      const savedDestination = await manager.save(Transaction, destinationLeg);

      sourceAccount.balance =
        Number(sourceAccount.balance) - Number(dto.amount);
      destinationAccount.balance =
        Number(destinationAccount.balance) + Number(dto.amount);
      await manager.save(Account, [sourceAccount, destinationAccount]);

      savedSource.account = sourceAccount;
      savedDestination.account = destinationAccount;

      return { source: savedSource, destination: savedDestination };
    });

    this.logger.log(`Transferencia ${groupId} creada exitosamente`);

    return {
      responseType: ResponseTypeEnum.Success,
      title: 'Transferencia registrada',
      message: 'La transferencia se guardó correctamente',
      data: this.transactionsMapper.toTransferDetailResponse(pair),
    };
  }

  async updateTransfer(
    userId: number,
    transferGroupId: string,
    dto: UpdateTransferRequest,
  ): Promise<ResponseAPI<TransferDetailResponse>> {
    this.logger.log(
      `Actualizando transferencia ${transferGroupId} para usuario ${userId}`,
    );

    const updated = await this.dataSource.transaction(async (manager) => {
      const legs = await this.loadTransferLegs(
        manager,
        userId,
        transferGroupId,
      );

      const newSourceAccountId = dto.sourceAccountId ?? legs.source.account.id;
      const newDestinationAccountId =
        dto.destinationAccountId ?? legs.destination.account.id;

      if (newSourceAccountId === newDestinationAccountId) {
        throw new BadRequestException({
          message: 'La cuenta origen y destino deben ser distintas',
          errorCode: ErrorCodeEnum.TRANSFER_SAME_ACCOUNT,
        });
      }

      const accountIds = Array.from(
        new Set([
          legs.source.account.id,
          legs.destination.account.id,
          newSourceAccountId,
          newDestinationAccountId,
        ]),
      );

      const archivedAllowedIds = new Set<number>([
        legs.source.account.id,
        legs.destination.account.id,
      ]);

      const accounts = await this.loadAccountsForUser(
        manager,
        userId,
        accountIds,
        archivedAllowedIds,
      );

      const oldSource = accounts.get(legs.source.account.id)!;
      const oldDestination = accounts.get(legs.destination.account.id)!;
      const newSource = accounts.get(newSourceAccountId)!;
      const newDestination = accounts.get(newDestinationAccountId)!;

      const oldAmount = Number(legs.source.amount);
      const newAmount = dto.amount ?? oldAmount;
      const newDate = dto.date
        ? (dto.date.split('T')[0] as unknown as Date)
        : legs.source.date;
      const newDescription =
        dto.description !== undefined
          ? dto.description
          : legs.source.description;

      oldSource.balance = Number(oldSource.balance) + oldAmount;
      oldDestination.balance = Number(oldDestination.balance) - oldAmount;

      newSource.balance = Number(newSource.balance) - newAmount;
      newDestination.balance = Number(newDestination.balance) + newAmount;

      legs.source.amount = newAmount;
      legs.source.date = newDate;
      legs.source.description = newDescription;
      legs.source.account = newSource;

      legs.destination.amount = newAmount;
      legs.destination.date = newDate;
      legs.destination.description = newDescription;
      legs.destination.account = newDestination;

      const affectedAccounts = Array.from(accounts.values());
      await manager.save(Account, affectedAccounts);
      await manager.save(Transaction, [legs.source, legs.destination]);

      return legs;
    });

    this.logger.log(
      `Transferencia ${transferGroupId} actualizada exitosamente`,
    );

    return {
      responseType: ResponseTypeEnum.Success,
      title: 'Transferencia actualizada',
      message: 'La transferencia se actualizó correctamente',
      data: this.transactionsMapper.toTransferDetailResponse(updated),
    };
  }

  async deleteTransfer(userId: number, transferGroupId: string): Promise<void> {
    this.logger.log(
      `Eliminando transferencia ${transferGroupId} para usuario ${userId}`,
    );

    await this.dataSource.transaction(async (manager) => {
      const legs = await this.loadTransferLegs(
        manager,
        userId,
        transferGroupId,
      );
      const amount = Number(legs.source.amount);

      const sourceAccount = await manager.findOne(Account, {
        where: { id: legs.source.account.id },
      });
      const destinationAccount = await manager.findOne(Account, {
        where: { id: legs.destination.account.id },
      });

      if (!sourceAccount || !destinationAccount) {
        throw new NotFoundException({
          message: 'Cuenta asociada a la transferencia no encontrada',
          errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
        });
      }

      sourceAccount.balance = Number(sourceAccount.balance) + amount;
      destinationAccount.balance = Number(destinationAccount.balance) - amount;

      await manager.save(Account, [sourceAccount, destinationAccount]);
      await manager.remove(Transaction, [legs.source, legs.destination]);
    });

    this.logger.log(`Transferencia ${transferGroupId} eliminada exitosamente`);
  }

  async findTransferByGroupId(
    transferGroupId: string,
    userId: number,
  ): Promise<TransferDetailResponse> {
    this.logger.log(
      `Buscando transferencia ${transferGroupId} para usuario ${userId}`,
    );

    const legs = await this.loadTransferLegs(
      this.dataSource.manager,
      userId,
      transferGroupId,
    );

    return this.transactionsMapper.toTransferDetailResponse(legs);
  }

  private collapseListForGlobal(
    transactions: Transaction[],
  ): TransactionListResponse[] {
    const result: TransactionListResponse[] = [];
    const pendingByGroup = new Map<string, Transaction>();

    for (const tx of transactions) {
      if (!tx.transferGroupId) {
        result.push(this.transactionsMapper.toMovementListResponse(tx));
        continue;
      }

      const groupId = tx.transferGroupId;
      const partner = pendingByGroup.get(groupId);
      if (!partner) {
        pendingByGroup.set(groupId, tx);
        continue;
      }

      const sourceLeg = tx.type === TransactionTypeEnum.Expense ? tx : partner;
      const destinationLeg =
        tx.type === TransactionTypeEnum.Income ? tx : partner;

      result.push(
        this.transactionsMapper.toTransferListResponse({
          source: sourceLeg,
          destination: destinationLeg,
        }),
      );
      pendingByGroup.delete(groupId);
    }

    // Piernas huerfanas (partner fuera del set por filtros): exponer la pierna
    // que se vio como movimiento normal para no perderla del listado.
    for (const orphan of pendingByGroup.values()) {
      result.push(this.transactionsMapper.toMovementListResponse(orphan));
    }

    return result;
  }

  private async loadCounterpartyAccounts(
    transactions: Transaction[],
    excludeAccountId: number,
  ): Promise<Map<string, { id: number; name: string }>> {
    const groupIds = Array.from(
      new Set(
        transactions
          .map((tx) => tx.transferGroupId)
          .filter((id): id is string => id !== null),
      ),
    );

    if (groupIds.length === 0) return new Map();

    const counterpartLegs = await this.transactionRepository.find({
      where: {
        transferGroupId: In(groupIds),
        account: { id: Not(excludeAccountId) },
      },
      relations: ['account'],
    });

    const map = new Map<string, { id: number; name: string }>();
    for (const leg of counterpartLegs) {
      if (!leg.transferGroupId) continue;
      map.set(leg.transferGroupId, {
        id: leg.account.id,
        name: leg.account.name,
      });
    }
    return map;
  }

  private async loadTransferLegs(
    manager: EntityManager,
    userId: number,
    transferGroupId: string,
  ): Promise<TransferLegs> {
    const legs = await manager.find(Transaction, {
      where: { transferGroupId, user: { id: userId } },
      relations: ['account'],
    });

    if (legs.length !== 2) {
      throw new NotFoundException({
        message: `Transfer with id ${transferGroupId} not found`,
        errorCode: ErrorCodeEnum.TRANSFER_NOT_FOUND,
      });
    }

    const source = legs.find((l) => l.type === TransactionTypeEnum.Expense);
    const destination = legs.find((l) => l.type === TransactionTypeEnum.Income);

    if (!source || !destination) {
      throw new NotFoundException({
        message: `Transfer with id ${transferGroupId} is corrupted`,
        errorCode: ErrorCodeEnum.TRANSFER_NOT_FOUND,
      });
    }

    return { source, destination };
  }

  private async loadUsableAccounts(
    manager: EntityManager,
    userId: number,
    accountIds: number[],
  ): Promise<Map<number, Account>> {
    const accounts = await manager.find(Account, {
      where: { id: In(accountIds), user: { id: userId } },
    });

    const map = new Map<number, Account>();
    for (const account of accounts) map.set(account.id, account);

    for (const id of accountIds) {
      const account = map.get(id);
      if (!account) {
        throw new NotFoundException({
          message: `Account with id ${id} not found`,
          errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
        });
      }
      if (account.archivedAt !== null) {
        throw new BadRequestException({
          message:
            'No se pueden registrar transferencias con cuentas archivadas',
          errorCode: ErrorCodeEnum.ACCOUNT_ARCHIVED,
        });
      }
    }

    return map;
  }

  private async loadAccountsForUser(
    manager: EntityManager,
    userId: number,
    accountIds: number[],
    archivedAllowedIds: Set<number>,
  ): Promise<Map<number, Account>> {
    const accounts = await manager.find(Account, {
      where: { id: In(accountIds), user: { id: userId } },
    });

    const map = new Map<number, Account>();
    for (const account of accounts) map.set(account.id, account);

    for (const id of accountIds) {
      const account = map.get(id);
      if (!account) {
        throw new NotFoundException({
          message: `Account with id ${id} not found`,
          errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
        });
      }
      if (account.archivedAt !== null && !archivedAllowedIds.has(id)) {
        throw new BadRequestException({
          message:
            'No se pueden registrar transferencias con cuentas archivadas',
          errorCode: ErrorCodeEnum.ACCOUNT_ARCHIVED,
        });
      }
    }

    return map;
  }

  private async cleanupUploadedPhotos(urls: string[]): Promise<void> {
    for (const url of urls) {
      if (!url.startsWith(TRANSACTION_UPLOAD_PREFIX)) continue;
      try {
        await unlink(join(process.cwd(), url));
      } catch {
        // archivo no existe o no se pudo borrar; no es critico
      }
    }
  }

  private async updateAccountBalance(
    accountId: number,
    amount: number,
    type: TransactionTypeEnum,
    revert = false,
  ): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException({
        message: `Account with id ${accountId} not found`,
        errorCode: ErrorCodeEnum.ACCOUNT_NOT_FOUND,
      });
    }

    let balanceChange = Number(amount);

    if (type === TransactionTypeEnum.Expense) {
      balanceChange = -balanceChange;
    }

    if (revert) {
      balanceChange = -balanceChange;
    }

    account.balance = Number(account.balance) + balanceChange;
    await this.accountRepository.save(account);
  }
}
