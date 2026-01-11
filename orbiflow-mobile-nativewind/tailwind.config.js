/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Agrega aquí tus tokens de color personalizados
        primary: {
          1: "#e3eded",
          2: "#c8dcdc",
          3: "#adcaca",
          4: "#92b9b9",
          5: "#77a8a8",
          6: "#5f8686",
          7: "#476464",
          8: "#2f4343",
          9: "#172121",
        },
        secondary: {
          first: {
            soft: "#D8D8E9",
            medium: "#8E8DBE",
            hard: "#444375",
          },
          second: {
            soft: "#D5C5E7",
            medium: "#9B75C7",
            hard: "#452965",
          },
          third: {
            soft: "#EACE99",
            medium: "#D9A444",
            hard: "#775618",
          },
        },
        // O define colores simples
        brand: "#3b82f6",
        accent: "#d946ef",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        background: {
          light: "#ffffff",
          dark: "#0f172a",
        },
        text: {
          light: "#1f2937",
          dark: "#f9fafb",
        },
      },
    },
  },
  plugins: [],
};
