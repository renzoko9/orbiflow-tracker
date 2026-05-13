/**
 * Tokens semanticos expuestos a Tailwind.
 *
 * Mapeo light/dark via la directiva darkMode "class" definida en tailwind.config.
 * Esto se consume desde tailwind.config.js (Node) por eso es un .js sin types.
 *
 * Convencion: bg-{token}, text-{token}, border-{token}.
 *
 * En componentes preferir tokens semanticos:
 *   ✅ className="bg-surface text-textPrimary"
 *   ❌ className="bg-white text-gray-900"
 *   ❌ className="bg-[#1B2A5B]"
 *
 * Para preparar dark mode (proximo sprint), agregar variantes dark: aqui o
 * usar variables CSS con set en runtime via ThemeProvider.
 */

// Replica plana del lightTokens de tokens.ts. Mantenerlos sincronizados.
// Si crece, generar este JS desde TS con un script de build.
const palette = require("./_palette.cjs");

const semanticColors = {
  background: palette.neutral[50],
  surface: palette.neutral[0],
  surfaceMuted: palette.neutral[100],
  surfaceInverse: palette.midnight[700],

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

module.exports = { semanticColors };
