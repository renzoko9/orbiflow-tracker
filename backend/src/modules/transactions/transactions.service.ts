import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { Transaction } from '@Entities';
import { TransactionRepository, AccountRepository } from '@Repositories';
import { CreateTransactionRequest } from './dto/create-transaction.dto';
import { UpdateTransactionRequest } from './dto/update-transaction.dto';
import { FilterTransactionsQuery } from './dto/filter-transactions.dto';
import { CategoryTypeEnum, ErrorCodeEnum, ResponseTypeEnum } from '@Enums';
import { ResponseAPI } from '@/common/interfaces/response.interface';
import {
  TransactionResponse,
  TransactionListResponse,
  TransactionDetailResponse,
} from './models/transaction-response.model';
import { TransactionsMapper } from './transactions.mapper';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionsMapper: TransactionsMapper,
  ) {}

  async create(
    userId: number,
    createTransactionRequest: CreateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
    this.logger.log(`Creando transacción para usuario ${userId}`);

    // Verificar que la cuenta pertenezca al usuario
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

    // Crear la transaccion
    const newTransaction = this.transactionRepository.create({
      amount: createTransactionRequest.amount,
      description: createTransactionRequest.description,
      type: createTransactionRequest.type,
      date: createTransactionRequest.date.split('T')[0] as unknown as Date,
      user: { id: userId },
      account: { id: createTransactionRequest.accountId },
      category: { id: createTransactionRequest.categoryId },
    });

    const savedTransaction =
      await this.transactionRepository.save(newTransaction);

    // Actualizar el balance de la cuenta
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
  }

  async findAll(
    userId: number,
    filters: FilterTransactionsQuery = {},
  ): Promise<TransactionListResponse[]> {
    this.logger.log(
      `Listando transacciones para usuario ${userId} | Filtros: ${JSON.stringify(filters)}`,
    );

    const where: FindOptionsWhere<Transaction>[] = [];

    const baseWhere: FindOptionsWhere<Transaction> = {
      user: { id: userId },
      account: { archivedAt: IsNull() },
      ...(filters.type && { type: filters.type }),
      ...(filters.categoryId && { category: { id: filters.categoryId } }),
      ...(filters.dateFrom && {
        date: MoreThanOrEqual(new Date(filters.dateFrom)),
      }),
      ...(filters.dateTo && {
        date: LessThanOrEqual(new Date(filters.dateTo)),
      }),
    };

    // Si hay dateFrom Y dateTo, combinar ambas condiciones
    if (filters.dateFrom && filters.dateTo) {
      baseWhere.date = MoreThanOrEqual(new Date(filters.dateFrom));
      // TypeORM no permite 2 operadores en el mismo campo con FindOptions,
      // así que filtramos dateTo en memoria cuando hay rango
    }

    if (filters.search) {
      // Buscar en descripción O nombre de categoría
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

    const transactions = await this.transactionRepository.find({
      where,
      relations: ['category', 'account'],
      order: {
        date: 'DESC',
        createdAt: 'DESC',
      },
      take: filters.limit,
    });

    // Filtrar dateTo en memoria cuando hay rango completo
    const filtered =
      filters.dateFrom && filters.dateTo
        ? transactions.filter((tx) => {
            const txDate =
              tx.date instanceof Date
                ? tx.date.toISOString().split('T')[0]
                : String(tx.date);
            return txDate <= filters.dateTo!;
          })
        : transactions;

    this.logger.log(`Se encontraron ${filtered.length} transacciones`);

    return filtered.map((transaction) =>
      this.transactionsMapper.toListResponse(transaction),
    );
  }

  async findByAccount(
    accountId: number,
    userId: number,
  ): Promise<TransactionListResponse[]> {
    this.logger.log(
      `Listando transacciones de cuenta ${accountId} para usuario ${userId}`,
    );

    // Verificar que la cuenta pertenezca al usuario
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

    return transactions.map((transaction) =>
      this.transactionsMapper.toListResponse(transaction),
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
    updateTransactionDto: UpdateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
    this.logger.log(`Actualizando transacción ${id} para usuario ${userId}`);

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
        message: 'You can only update your own transactions',
        errorCode: ErrorCodeEnum.FORBIDDEN_RESOURCE,
      });
    }

    // Si se cambia la cuenta, verificar que la nueva cuenta pertenezca al usuario
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

      // Revertir el efecto en la cuenta anterior
      await this.updateAccountBalance(
        transaction.account.id,
        transaction.amount,
        transaction.type,
        true, // revert
      );

      // Aplicar el efecto en la nueva cuenta
      await this.updateAccountBalance(
        updateTransactionDto.accountId,
        updateTransactionDto.amount ?? transaction.amount,
        updateTransactionDto.type ?? transaction.type,
      );
    } else if (
      updateTransactionDto.amount !== undefined ||
      updateTransactionDto.type !== undefined
    ) {
      // Si cambia el monto o el tipo, recalcular el balance
      // Primero revertir el efecto anterior
      await this.updateAccountBalance(
        transaction.account.id,
        transaction.amount,
        transaction.type,
        true, // revert
      );

      // Aplicar el nuevo efecto
      await this.updateAccountBalance(
        transaction.account.id,
        updateTransactionDto.amount ?? transaction.amount,
        updateTransactionDto.type ?? transaction.type,
      );
    }

    // Actualizar la transacci�n
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
    });

    await this.transactionRepository.save(transaction);

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

    // Revertir el efecto en el balance de la cuenta
    await this.updateAccountBalance(
      transaction.account.id,
      Number(transaction.amount),
      transaction.type,
      true, // revert
    );

    await this.transactionRepository.remove(transaction);

    this.logger.log(`Transacción ${id} eliminada exitosamente`);
  }

  private async updateAccountBalance(
    accountId: number,
    amount: number,
    type: CategoryTypeEnum,
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

    let balanceChange = amount;

    // Si es EXPENSE, restar del balance
    if (type === CategoryTypeEnum.Expense) {
      balanceChange = -amount;
    }

    // Si estamos revirtiendo, invertir el cambio
    if (revert) {
      balanceChange = -balanceChange;
    }

    account.balance = Number(account.balance) + balanceChange;
    await this.accountRepository.save(account);
  }
}
