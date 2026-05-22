import type { TransactionType } from "../model";

/**
 * Query keys de categories.
 */
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (type?: TransactionType) =>
    [...categoryKeys.lists(), type ?? "all"] as const,
  archived: () => [...categoryKeys.all, "archived"] as const,
  detail: (id: number) => [...categoryKeys.all, "detail", id] as const,
};
