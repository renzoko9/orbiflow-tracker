import { APP_CONSTANTS } from "@/config";

/**
 * Helpers de formato. Centralizados para que cuando agreguemos i18n real
 * o cambio de moneda no haya que tocar cada componente.
 */

const numberFormatter = new Intl.NumberFormat(APP_CONSTANTS.locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat(APP_CONSTANTS.locale, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat(APP_CONSTANTS.locale, {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(APP_CONSTANTS.locale, {
  day: "2-digit",
  month: "short",
});

const monthFormatter = new Intl.DateTimeFormat(APP_CONSTANTS.locale, {
  month: "long",
});

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return `${APP_CONSTANTS.currencySymbol} 0.00`;
  return `${APP_CONSTANTS.currencySymbol} ${numberFormatter.format(value)}`;
}

export function formatNumber(value: number): string {
  return integerFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return dateFormatter.format(d);
}

export function formatShortDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return shortDateFormatter.format(d);
}

export function formatMonthName(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const month = monthFormatter.format(d);
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function getCurrentMonthName(): string {
  return formatMonthName(new Date());
}
