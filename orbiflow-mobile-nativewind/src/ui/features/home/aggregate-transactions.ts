import { TransactionListResponse } from "@/src/core/dto/transaction.interface";
import { CategoryType } from "@/src/core/enums/category-type.enum";

const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

export function getCurrentMonthRange(): DateRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { dateFrom: formatDate(start), dateTo: formatDate(today) };
}

export function getPreviousMonthRange(): DateRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);
  return { dateFrom: formatDate(start), dateTo: formatDate(end) };
}

export function getCurrentMonthName(): string {
  const today = new Date();
  return `${MONTH_NAMES_ES[today.getMonth()]} ${today.getFullYear()}`;
}

export interface MonthSummary {
  income: number;
  expenses: number;
  net: number;
}

export function aggregateMonth(
  transactions: TransactionListResponse[],
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
  transactions: TransactionListResponse[],
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
