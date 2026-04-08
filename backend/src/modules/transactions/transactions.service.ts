import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Transaction } from '@Entities';
import { TransactionRepository, AccountRepository } from '@Repositories';
import { CreateTransactionRequest } from './dto/create-transaction.dto';
import { UpdateTransactionRequest } from './dto/update-transaction.dto';
import { CategoryTypeEnum, ErrorCodeEnum, ResponseTypeEnum } from '@Enums';
import { ResponseAPI } from '@/common/interfaces/response.interface';
import {
  TransactionResponse,
  TransactionListResponse,
} from './models/transaction-response.model';
import { TransactionsMapper } from './transactions.mapper';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
    private readonly transactionsMapper: TransactionsMapper,
  ) {}

  async create(
    userId: number,
    createTransactionRequest: CreateTransactionRequest,
  ): Promise<ResponseAPI<TransactionResponse>> {
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

    // Crear la transaccion
    const newTransaction = this.transactionRepository.create({
      amount: createTransactionRequest.amount,
      description: createTransactionRequest.description,
      type: createTransactionRequest.type,
      date: new Date(createTransactionRequest.date),
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

    const transaction = await this.findOne(savedTransaction.id, userId);

    return {
      responseType: ResponseTypeEnum.Success,
      title: 'Transacción registrada',
      message: 'El movimiento se guardó correctamente',
      data: transaction,
    };
  }

  async findAll(userId: number): Promise<TransactionListResponse[]> {
    const transactions = await this.transactionRepository.find({
      where: { user: { id: userId } },
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

  async findByAccount(
    accountId: number,
    userId: number,
  ): Promise<TransactionListResponse[]> {
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

  async findOne(id: number, userId: number): Promise<TransactionResponse> {
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

    return this.transactionsMapper.toResponse(transaction);
  }

  async update(
    id: number,
    userId: number,
    updateTransactionDto: UpdateTransactionRequest,
  ): Promise<TransactionResponse> {
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
        ? new Date(updateTransactionDto.date)
        : transaction.date,
      category: updateTransactionDto.categoryId
        ? { id: updateTransactionDto.categoryId }
        : transaction.category,
      account: updateTransactionDto.accountId
        ? { id: updateTransactionDto.accountId }
        : transaction.account,
    });

    await this.transactionRepository.save(transaction);
    return this.findOne(id, userId);
  }

  async delete(id: number, userId: number): Promise<void> {
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
