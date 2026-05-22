import { TransactionType } from "@/features/categories";

/**
 * DTOs del backend para transacciones.
 *
 * El listado global (`GET /transactions`) devuelve una union discriminada por
 * `kind`: las transferencias se colapsan a una sola fila y comparten el feed
 * con los movimientos normales.
 *
 * El listado por cuenta (`GET /transactions/account/:id`) devuelve siempre
 * filas tipo `movement`, pero las que pertenecen a una transferencia traen
 * `transferGroupId` y `counterpartyAccount` para que la UI las renderice
 * distinto.
 */

export interface TransactionCategoryEmbed {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface TransactionAccountEmbed {
  id: number;
  name: string;
  balance: number;
}

export interface AccountRefEmbed {
  id: number;
  name: string;
}

export interface MovementListItem {
  kind: "movement";
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  category: TransactionCategoryEmbed | null;
  accountId: number;
  accountName: string;
}

export interface TransferListItem {
  kind: "transfer";
  transferGroupId: string;
  amount: number;
  description: string;
  date: string;
  sourceAccount: AccountRefEmbed;
  destinationAccount: AccountRefEmbed;
}

export type TransactionListItem = MovementListItem | TransferListItem;

export interface AccountMovementListItem {
  kind: "movement";
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  category: TransactionCategoryEmbed | null;
  accountId: number;
  accountName: string;
  transferGroupId: string | null;
  counterpartyAccount: AccountRefEmbed | null;
}

export interface TransactionDetailDto {
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  category: TransactionCategoryEmbed | null;
  account: TransactionAccountEmbed;
  transferGroupId: string | null;
  createdAt: string;
}

export interface TransferDetailDto {
  transferGroupId: string;
  amount: number;
  description: string;
  date: string;
  sourceAccount: TransactionAccountEmbed;
  destinationAccount: TransactionAccountEmbed;
  createdAt: string;
}

export interface TransactionMutationDto {
  id: number;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  categoryName: string | null;
  accountName: string;
}

export interface CreateTransactionInput {
  amount: number;
  description?: string;
  type: TransactionType;
  date: string;
  categoryId?: number;
  accountId: number;
}

export interface UpdateTransactionInput {
  amount?: number;
  description?: string;
  type?: TransactionType;
  date?: string;
  categoryId?: number;
  accountId?: number;
}

export interface CreateTransferInput {
  amount: number;
  description?: string;
  date: string;
  sourceAccountId: number;
  destinationAccountId: number;
}

export interface UpdateTransferInput {
  amount?: number;
  description?: string;
  date?: string;
  sourceAccountId?: number;
  destinationAccountId?: number;
}

export interface FilterTransactionsParams {
  type?: TransactionType;
  kind?: "transfer";
  categoryId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
}

export type TransactionDetail = TransactionDetailDto;
export type TransferDetail = TransferDetailDto;

export function isTransferListItem(
  item: TransactionListItem,
): item is TransferListItem {
  return item.kind === "transfer";
}
