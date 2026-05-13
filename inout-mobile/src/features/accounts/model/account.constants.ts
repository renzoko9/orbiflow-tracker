/**
 * Iconos y colores disponibles para personalizar cuentas.
 * Mantener en sync con el set permitido por el backend.
 */
export const ACCOUNT_ICONS = [
  "wallet",
  "credit-card",
  "landmark",
  "piggy-bank",
  "briefcase",
  "hand-coins",
  "circle-dollar-sign",
  "receipt",
] as const;

export const ACCOUNT_COLORS = [
  "#1B2A5B",
  "#2A3B6C",
  "#FFB347",
  "#2BB673",
  "#C9462C",
  "#2C8E96",
  "#9B75C7",
  "#D88106",
] as const;

export const DEFAULT_ACCOUNT_ICON = "wallet";
export const DEFAULT_ACCOUNT_COLOR = "#1B2A5B";
