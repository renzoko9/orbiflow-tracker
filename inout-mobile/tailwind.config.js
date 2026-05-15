/**
 * Tailwind config para INOUT.
 *
 * Estrategia de tema:
 * - La paleta cruda vive en src/shared/theme/palette.ts (no se usa directo en componentes).
 * - Los tokens semanticos (bg-surface, text-primary, etc.) se exponen aqui.
 * - Cada token resuelve a una variable CSS (--color-...) que el ThemeProvider
 *   puede sobreescribir en runtime para light / dark.
 *
 * Para dark mode (proximo sprint):
 *   1) Activar darkMode: "class" debajo
 *   2) ThemeProvider monta className "dark" en el root cuando corresponda
 *   3) En este archivo agregar variantes con CSS vars dark
 */
const { semanticColors } = require("./src/shared/theme/tailwind-tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: semanticColors,
      fontFamily: {
        // Inter (sans, body/UI). Cada peso es una familia distinta para que
        // RN cargue la variante correcta en Android (que no hace bold sintetico).
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
        "sans-extrabold": ["Inter_800ExtraBold"],

        // Oswald (condensada). Para montos y headlines de impacto.
        // Soporta tabular-nums via fontVariant en RN (binario incluye feature tnum).
        display: ["Oswald_500Medium"],
        "display-semibold": ["Oswald_600SemiBold"],
        "display-bold": ["Oswald_700Bold"],
      },
    },
  },
  plugins: [],
};
