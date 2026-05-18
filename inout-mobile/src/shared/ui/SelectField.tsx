import { type ReactNode } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { cn } from "@/shared/utils";

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  icon?: ReactNode;
  rightLabel?: string;
  error?: string;
  onPress: () => void;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

/**
 * Campo que se ve como un Input pero al tocarse abre algo (BottomSheet, picker).
 */
export function SelectField({
  label,
  placeholder,
  icon,
  rightLabel,
  error,
  onPress,
}: SelectFieldProps) {
  const tokens = useThemeTokens();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="w-full">
      <View
        className={cn(
          "flex-row items-center rounded-xl px-3 py-3 bg-surface border",
          error ? "border-danger" : "border-border",
        )}
      >
        {icon ? <View className="mr-2">{icon}</View> : null}
        <Text
          className={cn(
            "flex-1 text-base",
            label ? "text-textPrimary" : "text-textTertiary",
          )}
          numberOfLines={1}
        >
          {label ?? placeholder ?? "Selecciona..."}
        </Text>
        {rightLabel ? (
          <Text
            className="text-base font-display-bold text-textSecondary mr-2"
            style={[{ includeFontPadding: false }, tabular]}
            numberOfLines={1}
          >
            {rightLabel}
          </Text>
        ) : null}
        <ChevronDown size={18} color={tokens.textTertiary} />
      </View>
      {error ? (
        <Text className="text-sm text-danger mt-1">{error}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
