import { getRelativeDayLabel } from "@/shared/utils";
import type { TransactionListItem } from "./transaction.types";

export interface TransactionSection {
  title: string;
  data: TransactionListItem[];
}

/**
 * Agrupa por fecha y mantiene el orden de aparicion.
 * Asume que `transactions` ya viene ordenado por fecha desc.
 */
export function groupTransactionsByDate(
  transactions: TransactionListItem[],
): TransactionSection[] {
  const grouped = new Map<string, TransactionListItem[]>();

  for (const tx of transactions) {
    const label = getRelativeDayLabel(tx.date.split("T")[0] ?? tx.date);
    const group = grouped.get(label);
    if (group) {
      group.push(tx);
    } else {
      grouped.set(label, [tx]);
    }
  }

  return Array.from(grouped.entries()).map(([title, data]) => ({
    title,
    data,
  }));
}

export function getListItemKey(item: TransactionListItem): string {
  return item.kind === "transfer"
    ? `transfer:${item.transferGroupId}`
    : `movement:${item.id}`;
}
