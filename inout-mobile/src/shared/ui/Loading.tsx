import { ActivityIndicator, View } from "react-native";
import { useThemeTokens } from "@/shared/theme";

interface LoadingProps {
  /** "fill" centra en todo el espacio disponible. "inline" no agrega padding. */
  variant?: "fill" | "inline";
}

export function Loading({ variant = "fill" }: LoadingProps) {
  const tokens = useThemeTokens();
  if (variant === "inline") {
    return <ActivityIndicator color={tokens.brand} />;
  }
  return (
    <View className="flex-1 items-center justify-center py-8">
      <ActivityIndicator color={tokens.brand} />
    </View>
  );
}
