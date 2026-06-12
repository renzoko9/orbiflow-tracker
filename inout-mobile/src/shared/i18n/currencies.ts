/**
 * Catalogo de monedas soportadas. El `code` (ISO 4217) es la fuente de
 * verdad que se persiste en el backend; symbol y locale alimentan el formato.
 * Mantener sincronizado con SUPPORTED_CURRENCY_CODES del backend.
 */

export interface CurrencyOption {
  code: string;
  symbol: string;
  locale: string;
  name: string;
}

export const DEFAULT_CURRENCY = "PEN";

export const CURRENCIES: CurrencyOption[] = [
  { code: "PEN", symbol: "S/", locale: "es-PE", name: "Sol peruano" },
  { code: "USD", symbol: "$", locale: "en-US", name: "Dolar estadounidense" },
  { code: "EUR", symbol: "€", locale: "es-ES", name: "Euro" },
  { code: "MXN", symbol: "$", locale: "es-MX", name: "Peso mexicano" },
  { code: "COP", symbol: "$", locale: "es-CO", name: "Peso colombiano" },
  { code: "CLP", symbol: "$", locale: "es-CL", name: "Peso chileno" },
  { code: "ARS", symbol: "$", locale: "es-AR", name: "Peso argentino" },
  { code: "BRL", symbol: "R$", locale: "pt-BR", name: "Real brasileno" },
  { code: "GBP", symbol: "£", locale: "en-GB", name: "Libra esterlina" },
];

/** Devuelve la moneda por code; cae al default (PEN) si no existe. */
export function getCurrency(code: string | undefined | null): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]!;
}
