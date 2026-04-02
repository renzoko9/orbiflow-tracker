import { View, Text, TouchableOpacity } from "react-native";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  activeColor?: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  activeColor = "bg-primary-6",
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <View className={`flex-row bg-inverse rounded-xl p-1 ${className}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`flex-1 py-3 rounded-lg items-center ${
              isActive ? activeColor : ""
            }`}
          >
            <Text
              className={`font-semibold text-base ${
                isActive ? "text-inverse" : "text-subordinary"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
