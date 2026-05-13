import { type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/shared/utils";

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  /** Aplica padding por defecto. */
  padded?: boolean;
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export function Card({
  children,
  className,
  padded = true,
  style,
  ...rest
}: CardProps) {
  return (
    <View
      className={cn(
        "rounded-2xl bg-surface",
        padded && "px-4 py-4",
        className,
      )}
      style={[cardShadow, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
