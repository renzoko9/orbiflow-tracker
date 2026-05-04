import { FilterTransactionsParams } from "@/src/core/dto/transaction.interface";

export const queryKeys = {
  accounts: {
    all: ["accounts"] as const,
    archived: ["accounts", "archived"] as const,
    detail: (id: number) => ["accounts", id] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    detail: (id: number) => ["transactions", id] as const,
    list: (filters?: FilterTransactionsParams) =>
      ["transactions", "list", filters] as const,
    byAccount: (accountId: number) =>
      ["transactions", "account", accountId] as const,
  },
  categories: {
    all: ["categories"] as const,
    archived: ["categories", "archived"] as const,
    detail: (id: number) => ["categories", id] as const,
  },
} as const;
