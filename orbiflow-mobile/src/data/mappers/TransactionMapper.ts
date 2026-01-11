import { Transaction, TransactionType } from '@domain/entities/Transaction';
import { TransactionResponseDTO } from '../api/dto/TransactionDTO';

export class TransactionMapper {
  static toDomain(dto: TransactionResponseDTO['data']): Transaction {
    if (!dto) throw new Error('Invalid DTO');

    return new Transaction(
      dto.id,
      parseFloat(dto.amount),
      dto.type,
      dto.description,
      dto.accountId,
      dto.categoryId,
      new Date(dto.date),
      new Date(dto.createdAt)
    );
  }

  static toDomainList(dtoList: Array<TransactionResponseDTO['data']>): Transaction[] {
    return dtoList
      .filter(dto => dto !== null && dto !== undefined)
      .map(dto => this.toDomain(dto));
  }

  static toAPI(transaction: Partial<Transaction>) {
    return {
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      date: transaction.date?.toISOString(),
    };
  }
}
