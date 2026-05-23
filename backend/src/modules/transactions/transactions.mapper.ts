import { Injectable } from '@nestjs/common';
import { TransactionTypeEnum } from '@Enums';
import { Transaction } from '@Entities';
import {
  AccountMovementListResponse,
  MovementListResponse,
  TransactionDetailResponse,
  TransactionResponse,
  TransferDetailResponse,
  TransferListResponse,
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

  toMovementListResponse(transaction: Transaction): MovementListResponse {
    return {
      kind: 'movement',
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

  toAccountMovementListResponse(
    transaction: Transaction,
    counterpartyAccount: { id: number; name: string } | null,
  ): AccountMovementListResponse {
    return {
      kind: 'movement',
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
      transferGroupId: transaction.transferGroupId,
      counterpartyAccount,
    };
  }

  toTransferListResponse(pair: {
    source: Transaction;
    destination: Transaction;
  }): TransferListResponse {
    const reference = pair.source;
    return {
      kind: 'transfer',
      transferGroupId: reference.transferGroupId as string,
      amount: Number(reference.amount),
      description: reference.description,
      date: this.formatDate(reference.date),
      sourceAccount: {
        id: pair.source.account.id,
        name: pair.source.account.name,
      },
      destinationAccount: {
        id: pair.destination.account.id,
        name: pair.destination.account.name,
      },
    };
  }

  toDetailResponse(transaction: Transaction): TransactionDetailResponse {
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
      account: {
        id: transaction.account.id,
        name: transaction.account.name,
        balance: Number(transaction.account.balance),
      },
      transferGroupId: transaction.transferGroupId,
      photos: transaction.photos ?? [],
      createdAt:
        transaction.createdAt instanceof Date
          ? transaction.createdAt.toISOString()
          : String(transaction.createdAt),
    };
  }

  toTransferDetailResponse(pair: {
    source: Transaction;
    destination: Transaction;
  }): TransferDetailResponse {
    const reference =
      pair.source.type === TransactionTypeEnum.Expense
        ? pair.source
        : pair.destination;
    return {
      transferGroupId: reference.transferGroupId as string,
      amount: Number(reference.amount),
      description: reference.description,
      date: this.formatDate(reference.date),
      sourceAccount: {
        id: pair.source.account.id,
        name: pair.source.account.name,
        balance: Number(pair.source.account.balance),
      },
      destinationAccount: {
        id: pair.destination.account.id,
        name: pair.destination.account.name,
        balance: Number(pair.destination.account.balance),
      },
      createdAt:
        reference.createdAt instanceof Date
          ? reference.createdAt.toISOString()
          : String(reference.createdAt),
    };
  }

  private formatDate(date: Date | string): string {
    return date instanceof Date
      ? date.toISOString().split('T')[0]
      : String(date);
  }
}
