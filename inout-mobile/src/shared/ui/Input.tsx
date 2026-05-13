import { useState, type ReactNode } from "react";
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

export interface InputProps
  extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  containerClassName = "",
  ...rest
}: InputProps) {
  const tokens = useThemeTokens();
  const [showPassword, setShowPassword] = useState(false);

  const resolvedRight = secureTextEntry ? (
    <TouchableOpacity
      onPress={() => setShowPassword((p) => !p)}
      hitSlop={8}
      accessibilityRole="button"
    >
      {showPassword ? (
        <EyeOff size={20} color={tokens.textTertiary} />
      ) : (
        <Eye size={20} color={tokens.textTertiary} />
      )}
    </TouchableOpacity>
  ) : (
    rightIcon
  );

  return (
    <View className={`w-full ${containerClassName}`}>
      {label ? (
        <Text className="text-sm font-medium text-textSecondary mb-2">
          {label}
        </Text>
      ) : null}

      <View
        className={`flex-row items-center rounded-xl px-3 py-3 bg-surface border ${error ? "border-danger" : "border-border"
          }`}
      >
        {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}

        <TextInput
          className="flex-1 text-[14px] text-textPrimary"
          placeholderTextColor={
            error ? tokens.danger : tokens.textTertiary
          }
          secureTextEntry={secureTextEntry && !showPassword}
          {...rest}
        />

        {resolvedRight ? <View className="ml-2">{resolvedRight}</View> : null}
      </View>

      {error ? (
        <Text className="text-[14px] text-danger mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
