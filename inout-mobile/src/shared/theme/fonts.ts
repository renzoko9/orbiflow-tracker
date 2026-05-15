import { Text, type TextStyle } from "react-native";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import {
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from "@expo-google-fonts/oswald";

/**
 * Mapa de fuentes a cargar al inicio de la app.
 * Inter para body/UI, Oswald (condensada) para montos y display.
 *
 * Cada peso es una familia distinta a proposito: en Android RN no hace bold
 * sintetico para fuentes custom, asi que cargamos cada peso real.
 *
 * Pasarle este objeto a `useFonts(fontMap)` en el root layout.
 */
export const fontMap = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
};

/**
 * Aplica Inter como fuente por defecto a TODOS los <Text> que no traigan
 * fontFamily explicita.
 *
 * Llamar una sola vez antes del primer render. Idempotente.
 */
let installed = false;
export function installTextDefaults(): void {
  if (installed) return;
  installed = true;

  const TextAny = Text as unknown as {
    defaultProps?: { style?: TextStyle | TextStyle[] };
  };
  TextAny.defaultProps = TextAny.defaultProps ?? {};
  const existing = TextAny.defaultProps.style;
  TextAny.defaultProps.style = [
    ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
    { fontFamily: "Inter_400Regular" },
  ];
}
