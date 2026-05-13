import { palette } from "./palette";

/**
 * Tokens semanticos.
 *
 * El esquema esta replicado para light y dark. Cada componente solo conoce
 * el nombre semantico (surface, textPrimary, success); el ThemeProvider
 * decide que valor concreto le llega segun el modo activo.
 *
 * Para activar dark mode (proximo sprint):
 *   - El ThemeProvider lee la preferencia (sistema / usuario)
 *   - Aplica `dark` className en el root cuando aplica
 *   - Tailwind config ya tiene darkMode: "class"
 *   - Los tokens dark de abajo se sirven via variantes "dark:bg-surface" etc.
 *
 * Mientras el dark mode no este activo, solo se usan los tokens light.
 */

export type ThemeMode = "light" | "dark";

export interface ThemeTokens {
  // Superficies
  background: string; // fondo de pantalla
  surface: string; // tarjetas, hojas
  surfaceMuted: string; // chips suaves, input rest, separadores claros
  surfaceInverse: string; // bloques contrastantes (insight cards)
  overlay: string; // overlays modales

  // Texto
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string; // texto sobre superficies oscuras
  textDisabled: string;

  // Bordes
  border: string;
  borderStrong: string;
  borderFocus: string;

  // Brand
  brand: string; // azul medianoche
  brandSoft: string;
  brandStrong: string;
  onBrand: string; // contenido sobre brand

  // Acento (mango)
  accent: string;
  accentSoft: string;
  accentStrong: string;
  onAccent: string;

  // Semanticos
  success: string;
  successSoft: string;
  onSuccess: string;

  danger: string;
  dangerSoft: string;
  onDanger: string;

  warning: string;
  warningSoft: string;
  onWarning: string;

  info: string;
  infoSoft: string;
  onInfo: string;

  // Especificos del dominio
  income: string; // = success
  expense: string; // = danger
}

export const lightTokens: ThemeTokens = {
  background: palette.neutral[50], // off-white calido
  surface: palette.neutral[0],
  surfaceMuted: palette.neutral[100],
  surfaceInverse: palette.midnight[700],
  overlay: "rgba(15, 21, 53, 0.45)",

  textPrimary: palette.neutral[900],
  textSecondary: palette.neutral[600],
  textTertiary: palette.neutral[500],
  textInverse: palette.neutral[0],
  textDisabled: palette.neutral[400],

  border: palette.neutral[200],
  borderStrong: palette.neutral[300],
  borderFocus: palette.midnight[700],

  brand: palette.midnight[700],
  brandSoft: palette.midnight[50],
  brandStrong: palette.midnight[800],
  onBrand: palette.neutral[0],

  accent: palette.mango[400],
  accentSoft: palette.mango[100],
  accentStrong: palette.mango[600],
  onAccent: palette.midnight[900],

  success: palette.mint[400],
  successSoft: palette.mint[100],
  onSuccess: palette.mint[900],

  danger: palette.terracotta[500],
  dangerSoft: palette.terracotta[100],
  onDanger: palette.terracotta[900],

  warning: palette.mango[500],
  warningSoft: palette.mango[100],
  onWarning: palette.mango[900],

  info: palette.teal[500],
  infoSoft: palette.teal[100],
  onInfo: palette.teal[900],

  income: palette.mint[500],
  expense: palette.terracotta[500],
};

/**
 * Tokens dark preparados para activar el modo en el proximo sprint.
 * NO se aplican aun (la app arranca en light forzado), pero la paridad esta lista.
 */
export const darkTokens: ThemeTokens = {
  background: palette.midnight[950],
  surface: palette.midnight[900],
  surfaceMuted: palette.midnight[800],
  surfaceInverse: palette.neutral[50],
  overlay: "rgba(0, 0, 0, 0.6)",

  textPrimary: palette.neutral[50],
  textSecondary: palette.neutral[300],
  textTertiary: palette.neutral[400],
  textInverse: palette.midnight[900],
  textDisabled: palette.neutral[600],

  border: palette.midnight[800],
  borderStrong: palette.midnight[600],
  borderFocus: palette.mango[400],

  brand: palette.midnight[400],
  brandSoft: palette.midnight[800],
  brandStrong: palette.midnight[200],
  onBrand: palette.neutral[0],

  accent: palette.mango[300],
  accentSoft: palette.mango[800],
  accentStrong: palette.mango[200],
  onAccent: palette.midnight[950],

  success: palette.mint[300],
  successSoft: palette.mint[800],
  onSuccess: palette.mint[50],

  danger: palette.terracotta[400],
  dangerSoft: palette.terracotta[800],
  onDanger: palette.terracotta[50],

  warning: palette.mango[400],
  warningSoft: palette.mango[800],
  onWarning: palette.mango[50],

  info: palette.teal[300],
  infoSoft: palette.teal[800],
  onInfo: palette.teal[50],

  income: palette.mint[300],
  expense: palette.terracotta[400],
};

export const themes: Record<ThemeMode, ThemeTokens> = {
  light: lightTokens,
  dark: darkTokens,
};
