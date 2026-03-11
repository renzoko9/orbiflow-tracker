import { CategoryType } from "../enums/category-type.enum";

export interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  type: CategoryType;
  date: string;
  userId: number;
  categoryId: number | null;
  accountId: number;
  createdAt: string;
}

export interface TransactionResponse {
  id: number;
  amount: number;
  description: string;
  type: CategoryType;
  date: string;
  category: {
    id: number;
    name: string;
    type: CategoryType;
  } | null;
  account: {
    id: number;
    name: string;
    balance: number;
  };
  createdAt: string;
}

export interface TransactionListResponse {
  id: number;
  amount: number;
  description: string;
  type: CategoryType;
  typeName: string;
  date: string;
  categoryId: number | null;
  categoryName: string | null;
  accountId: number;
  accountName: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  amount: number;
  description?: string;
  type: CategoryType;
  date: string; // ISO 8601 format
  categoryId?: number;
  accountId: number;
}

export interface UpdateTransactionRequest {
  amount?: number;
  description?: string;
  type?: CategoryType;
  date?: string;
  categoryId?: number;
  accountId?: number;
}
