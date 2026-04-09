import { TransactionListResponse } from "@/src/core/dto/transaction.interface";

interface TransactionSection {
  title: string;
  data: TransactionListResponse[];
}

function getDateLabel(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const toDateKey = (d: Date) => d.toISOString().split("T")[0];

  if (toDateKey(date) === toDateKey(today)) return "Hoy";
  if (toDateKey(date) === toDateKey(yesterday)) return "Ayer";

  return date.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function groupTransactionsByDate(
  transactions: TransactionListResponse[],
): TransactionSection[] {
  const grouped = new Map<string, TransactionListResponse[]>();

  for (const tx of transactions) {
    const label = getDateLabel(tx.date);
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
