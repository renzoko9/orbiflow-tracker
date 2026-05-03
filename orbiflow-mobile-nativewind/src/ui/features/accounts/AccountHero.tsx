import { View, Text } from "react-native";
import { getIconComponent } from "@/src/ui/utils/icon-map";

interface AccountHeroProps {
  name: string;
  balance: string;
  description: string | null;
  icon: string;
  color: string;
}

export function AccountHero({
  name,
  balance,
  description,
  icon,
  color,
}: AccountHeroProps) {
  const Icon = getIconComponent(icon);
  const numericBalance = Number(balance);

  return (
    <View className="flex-row items-center px-4 pt-2 pb-6">
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: color + "25" }}
      >
        <Icon size={32} color={color} />
      </View>

      <View className="flex-1">
        <Text
          className="text-lg font-semibold text-base-color"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-2xl font-bold text-base-color mt-0.5">
          S/ {numericBalance.toFixed(2)}
        </Text>
        {description ? (
          <Text className="text-sm text-subordinary mt-1" numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
