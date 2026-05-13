import { Text, View } from "react-native";
import { formatCurrency } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";

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
          className="text-lg font-semibold text-textPrimary"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-2xl font-bold text-textPrimary mt-0.5">
          {formatCurrency(balance)}
        </Text>
        {description ? (
          <Text
            className="text-sm text-textSecondary mt-1"
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
