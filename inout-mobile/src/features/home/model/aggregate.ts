import { CategoryType } from "@/features/categories";
import type { TransactionListItem } from "@/features/transactions";

/**
 * Agregaciones para la pantalla home.
 * Pure functions: input -> output, sin side effects.
 */

export interface MonthSummary {
  income: number;
  expenses: number;
  net: number;
}

export function aggregateMonth(
  transactions: TransactionListItem[],
): MonthSummary {
  const summary = transactions.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount);
      if (tx.type === CategoryType.INCOME) acc.income += amount;
      else acc.expenses += amount;
      return acc;
    },
    { income: 0, expenses: 0 },
  );
  return { ...summary, net: summary.income - summary.expenses };
}

export interface CategoryAggregate {
  id: number;
  name: string;
  icon: string;
  color: string;
  amount: number;
}

export function topExpenseCategories(
  transactions: TransactionListItem[],
  limit = 5,
): CategoryAggregate[] {
  const map = new Map<number, CategoryAggregate>();

  for (const tx of transactions) {
    if (tx.type !== CategoryType.EXPENSE || !tx.category) continue;
    const cat = tx.category;
    const existing = map.get(cat.id);
    if (existing) {
      existing.amount += Number(tx.amount);
    } else {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        amount: Number(tx.amount),
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
