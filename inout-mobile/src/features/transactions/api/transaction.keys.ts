import type { FilterTransactionsParams } from "../model";

/**
 * Query keys de transactions. Incluye los filtros activos para que cada
 * combinacion sea su propio cache entry.
 */
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters?: FilterTransactionsParams) =>
    [...transactionKeys.lists(), filters ?? {}] as const,
  byAccount: (accountId: number) =>
    [...transactionKeys.all, "by-account", accountId] as const,
  detail: (id: number) => [...transactionKeys.all, "detail", id] as const,
  transferDetail: (groupId: string) =>
    [...transactionKeys.all, "transfer", groupId] as const,
};
