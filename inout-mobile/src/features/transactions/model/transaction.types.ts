import { CategoryType } from "@/features/categories";

/**
 * DTOs del backend para transacciones.
 * El backend tiene 3 shapes distintas segun el endpoint:
 * - List: TransactionListResponse (con category embed + accountId/Name)
 * - Detail: TransactionDetailResponse (con category + account embed)
 * - Mutation result: TransactionResponse (resumido)
 */

export interface TransactionCategoryEmbed {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export interface TransactionAccountEmbed {
  id: number;
  name: string;
  balance: number;
}

export interface TransactionListItemDto {
  id: number;
  amount: number;
  description: string;
  type: CategoryType;
  date: string;
  category: TransactionCategoryEmbed | null;
  accountId: number;
  accountName: string;
}

export interface TransactionDetailDto {
  id: number;
  amount: number;
  description: string;
  type: CategoryType;
  date: string;
  category: TransactionCategoryEmbed | null;
  account: TransactionAccountEmbed;
  createdAt: string;
}

export interface TransactionMutationDto {
  id: number;
  amount: number;
  description: string;
  type: CategoryType;
  date: string;
  categoryName: string | null;
  accountName: string;
}

export interface CreateTransactionInput {
  amount: number;
  description?: string;
  type: CategoryType;
  date: string;
  categoryId?: number;
  accountId: number;
}

export interface UpdateTransactionInput {
  amount?: number;
  description?: string;
  type?: CategoryType;
  date?: string;
  categoryId?: number;
  accountId?: number;
}

export interface FilterTransactionsParams {
  type?: CategoryType;
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
}

/** Alias para uso comodo en componentes que reciben el listado. */
export type TransactionListItem = TransactionListItemDto;
export type TransactionDetail = TransactionDetailDto;
