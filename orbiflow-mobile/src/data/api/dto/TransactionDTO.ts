import { TransactionType } from '@domain/entities/Transaction';

export interface TransactionResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: {
    id: number;
    amount: string;
    type: TransactionType;
    description: string;
    accountId: number;
    categoryId: number;
    date: string;
    createdAt: string;
  };
}

export interface TransactionListResponseDTO {
  responseType: number;
  title: string;
  message: string;
  data?: Array<{
    id: number;
    amount: string;
    type: TransactionType;
    description: string;
    accountId: number;
    categoryId: number;
    date: string;
    createdAt: string;
  }>;
}
