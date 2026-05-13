/**
 * Helpers de fecha sin libreria externa.
 * Si la cantidad de logica crece, considerar date-fns.
 */

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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

export function getCurrentMonthRange(): DateRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { dateFrom: toDateKey(start), dateTo: toDateKey(today) };
}

export function getPreviousMonthRange(): DateRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth(), 0);
  return { dateFrom: toDateKey(start), dateTo: toDateKey(end) };
}

export function getCurrentMonthLabel(): string {
  const today = new Date();
  return `${MONTH_NAMES_ES[today.getMonth()]} ${today.getFullYear()}`;
}

export function getRelativeDayLabel(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (toDateKey(date) === toDateKey(today)) return "Hoy";
  if (toDateKey(date) === toDateKey(yesterday)) return "Ayer";

  return date.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
