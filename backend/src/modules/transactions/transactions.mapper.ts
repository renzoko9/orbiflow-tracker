import { Injectable } from '@nestjs/common';
import { Transaction } from 'src/database/entities/transaction.entity';
import { CategoryType } from 'src/common/enum/category-type.enum';
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
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            type: transaction.category.type,
          }
        : null,
      account: {
        id: transaction.account.id,
        name: transaction.account.name,
        balance: Number(transaction.account.balance),
      },
      createdAt: transaction.createdAt,
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
      typeName: transaction.type === CategoryType.INCOME ? 'Ingreso' : 'Gasto',
      date: dateStr,
      categoryId: transaction.category?.id || null,
      categoryName: transaction.category?.name || null,
      accountId: transaction.account.id,
      accountName: transaction.account.name,
      createdAt: transaction.createdAt,
    };
  }
}
