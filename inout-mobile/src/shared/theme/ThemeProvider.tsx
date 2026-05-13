import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { themes, type ThemeMode, type ThemeTokens } from "./tokens";

/**
 * ThemeProvider para INOUT.
 *
 * Estado actual: forzado en "light" (la paleta dark esta lista pero el switch
 * se activa en el proximo sprint cuando agreguemos persistencia + UI de Ajustes).
 *
 * Cuando se active dark mode:
 *   1) Cambiar `forcedMode` a undefined
 *   2) Persistir la preferencia del usuario (Zustand) y leerla aqui
 *   3) NativeWind detecta el modo via "class" en root o useColorScheme; aplicar
 *      `Appearance.setColorScheme(mode)` en el efecto de abajo.
 */

interface ThemeContextValue {
  mode: ThemeMode;
  tokens: ThemeTokens;
  setMode: (mode: ThemeMode | "system") => void;
  preference: ThemeMode | "system";
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Por ahora se deja en "light" hasta el sprint de dark mode. */
  forcedMode?: ThemeMode;
}

export function ThemeProvider({
  children,
  forcedMode = "light",
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemeMode | "system">(
    forcedMode ?? "system",
  );

  const resolvedMode: ThemeMode = forcedMode
    ? forcedMode
    : preference === "system"
      ? (systemScheme ?? "light")
      : preference;

  useEffect(() => {
    // Hook donde el proximo sprint llamaria Appearance.setColorScheme(resolvedMode)
    // y cambiaria className "dark" en el root para NativeWind.
  }, [resolvedMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: resolvedMode,
      tokens: themes[resolvedMode],
      setMode: setPreference,
      preference,
    }),
    [resolvedMode, preference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme debe usarse dentro de <ThemeProvider>.");
  }
  return ctx;
}

/** Acceso directo a tokens para componentes que no necesitan el resto del contexto. */
export function useThemeTokens(): ThemeTokens {
  return useTheme().tokens;
}
