import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import type { LucideIcon } from "lucide-react-native";

interface SelectFieldProps {
  icon: LucideIcon;
  label?: string;
  placeholder?: string;
  secondaryText?: string;
  onPress: () => void;
  error?: string;
  className?: string;
}

export function SelectField({
  icon: Icon,
  label,
  placeholder = "Selecciona una opción",
  secondaryText,
  onPress,
  error,
  className = "",
}: SelectFieldProps) {
  const hasValue = !!label;

  return (
    <View className={`w-full ${className}`}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`flex-row items-center border rounded-lg px-3 py-3 bg-background-light ${
          error ? "border-error-medium" : "border-primary-2"
        }`}
      >
        <Icon
          size={20}
          color={error ? colors.error.medium : colors.subordinary}
        />
        <Text
          className={`flex-1 ml-2 text-base ${
            hasValue
              ? "text-text-light"
              : error
                ? "text-error-medium"
                : "text-subordinary"
          }`}
        >
          {label ?? placeholder}
        </Text>
        {secondaryText && (
          <Text className="text-sm text-subordinary mr-2">{secondaryText}</Text>
        )}
        <ChevronDown
          size={18}
          color={error ? colors.error.medium : colors.subordinary}
        />
      </TouchableOpacity>

      {error && <Text className="text-sm text-error-medium mt-1">{error}</Text>}
    </View>
  );
}
