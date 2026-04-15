import { FilterTransactionsParams } from "@/src/core/dto/transaction.interface";

export const queryKeys = {
  accounts: {
    all: ["accounts"] as const,
    detail: (id: number) => ["accounts", id] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    detail: (id: number) => ["transactions", id] as const,
    list: (filters?: FilterTransactionsParams) =>
      ["transactions", "list", filters] as const,
  },
  categories: {
    all: ["categories"] as const,
  },
} as const;
