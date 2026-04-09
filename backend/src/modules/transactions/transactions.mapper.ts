import { Injectable } from '@nestjs/common';
import { Transaction } from '@Entities';
import {
  TransactionResponse,
  TransactionListResponse,
} from './models/transaction-response.model';

@Injectable()
export class TransactionsMapper {
  toResponse(transaction: Transaction): TransactionResponse {
    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      date: this.formatDate(transaction.date),
      categoryName: transaction.category?.name || null,
      accountName: transaction.account.name,
    };
  }

  toListResponse(transaction: Transaction): TransactionListResponse {
    return {
      id: transaction.id,
      amount: Number(transaction.amount),
      description: transaction.description,
      type: transaction.type,
      date: this.formatDate(transaction.date),
      category: transaction.category
        ? {
            id: transaction.category.id,
            name: transaction.category.name,
            icon: transaction.category.icon,
            color: transaction.category.color,
            type: transaction.category.type,
          }
        : null,
      accountId: transaction.account.id,
      accountName: transaction.account.name,
    };
  }

  private formatDate(date: Date | string): string {
    return date instanceof Date
      ? date.toISOString().split('T')[0]
      : String(date);
  }
}
