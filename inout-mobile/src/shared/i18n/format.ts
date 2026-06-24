import { APP_CONSTANTS } from "@/config";
import { useAuthStore } from "@/shared/auth";
import { getCurrency } from "./currencies";

/**
 * Helpers de formato. Centralizados para que cuando agreguemos i18n real
 * o cambio de moneda no haya que tocar cada componente.
 */

// Formateadores de moneda por locale (la moneda activa puede variar en runtime).
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(locale: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(locale, formatter);
  }
  return formatter;
}

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

const weekdayFormatter = new Intl.DateTimeFormat(APP_CONSTANTS.locale, {
  weekday: "long",
});

const dayOfMonthFormatter = new Intl.DateTimeFormat(APP_CONSTANTS.locale, {
  day: "numeric",
});

const headerDateFormatter = new Intl.DateTimeFormat(APP_CONSTANTS.locale, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat(APP_CONSTANTS.locale, {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(amount: number | string): string {
  const { symbol, locale } = getCurrency(
    useAuthStore.getState().user?.currency,
  );
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return `${symbol} 0.00`;
  return `${symbol} ${currencyFormatter(locale).format(value)}`;
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

/** "14:30": hora y minuto local. Pensado para timestamps del chat. */
export function formatTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return timeFormatter.format(d);
}

export function formatMonthName(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const month = monthFormatter.format(d);
  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function getCurrentMonthName(): string {
  return formatMonthName(new Date());
}

/**
 * Devuelve "Jueves 14": dia de la semana capitalizado + numero de dia.
 * Pensado para subtitulos cortos tipo header.
 */
export function formatWeekdayShort(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const weekday = weekdayFormatter.format(d);
  const day = dayOfMonthFormatter.format(d);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day}`;
}

/**
 * Devuelve "VIERNES 22 DE MAYO": fecha larga en mayusculas sin año.
 * Pensado para eyebrows de header donde el año actual es implicito.
 */
export function formatHeaderDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return headerDateFormatter.format(d).replace(/,/g, "").toUpperCase();
}

/**
 * "Hoy" / "Ayer" / "14 may" segun la cercania con la fecha actual.
 * Pensado para listas con muchos items donde la fecha exacta es ruido.
 */
export function formatRelativeDay(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, now)) return "Hoy";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Ayer";

  return formatShortDate(d);
}
