import { View, Text, TouchableOpacity } from "react-native";
import { cn } from "@/shared/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      className={cn(
        "flex-row bg-surfaceMuted rounded-xl p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              "flex-1 py-2.5 rounded-lg items-center",
              active && "bg-brand",
            )}
            activeOpacity={0.7}
          >
            <Text
              className={cn(
                "font-semibold text-sm",
                active ? "text-onBrand" : "text-textSecondary",
              )}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
