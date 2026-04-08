import { Injectable } from '@nestjs/common';
import { Transaction } from '@Entities';
import { CategoryTypeEnum } from '@Enums';
import {
  TransactionResponse,
  TransactionListResponse,
} from './models/transaction-response.model';

@Injectable()
export class TransactionsMapper {
  toResponse(transaction: Transaction): TransactionResponse {
    const dateStr =
      transaction.date instanceof Date
        ? transaction.date.toISOString().split('T')[0]
        : String(transaction.date);

    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      date: dateStr,
      categoryName: transaction.category?.name || null,
      accountName: transaction.account.name,
    };
  }

  toListResponse(transaction: Transaction): TransactionListResponse {
    const dateStr =
      transaction.date instanceof Date
        ? transaction.date.toISOString().split('T')[0]
        : String(transaction.date);

    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      typeName:
        transaction.type === CategoryTypeEnum.Income ? 'Ingreso' : 'Gasto',
      date: dateStr,
      categoryId: transaction.category?.id || null,
      categoryName: transaction.category?.name || null,
      accountId: transaction.account.id,
      accountName: transaction.account.name,
      createdAt: transaction.createdAt,
    };
  }
}
