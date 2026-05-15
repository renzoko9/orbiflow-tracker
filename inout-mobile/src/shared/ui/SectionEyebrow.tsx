import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { cn } from "@/shared/utils";

interface SectionEyebrowProps {
  label: string;
  rightElement?: ReactNode;
  className?: string;
}

/**
 * Etiqueta tipografica de seccion. Caps muy chicas con tracking generoso.
 * Reemplaza el patron "card title" para secciones que no necesitan caja.
 */
export function SectionEyebrow({
  label,
  rightElement,
  className,
}: SectionEyebrowProps) {
  return (
    <View
      className={cn(
        "flex-row items-center justify-between mb-4",
        className,
      )}
    >
      <Text
        className="text-[11px] font-sans-bold uppercase text-textTertiary"
      >
        {label}
      </Text>
      {rightElement}
    </View>
  );
}
