import { Text } from "react-native";
import { cn } from "@/shared/utils";

interface WordmarkProps {
  /** Override de tamano/color via clases tailwind (ej: "text-base text-textInverse"). */
  className?: string;
}

/**
 * Brand mark del producto. El separador "·" (medio punto) refleja la
 * dualidad ingresos/gastos del flujo financiero.
 *
 * Pensado como sello de marca: footers, headers de identidad, splash, etc.
 * El tamano y color se controlan con `className`; tracking y peso son fijos.
 */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <Text
      className={cn(
        "text-xs font-sans-extrabold uppercase text-textPrimary",
        className,
      )}
      style={{ letterSpacing: 1.6 }}
    >
      IN·OUT
    </Text>
  );
}
