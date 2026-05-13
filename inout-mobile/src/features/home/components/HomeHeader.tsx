import { Text, View } from "react-native";
import { formatCurrency } from "@/shared/i18n";

interface HomeHeaderProps {
  userName: string;
  totalBalance: number;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function HomeHeader({ userName, totalBalance }: HomeHeaderProps) {
  return (
    <View className="px-4 pt-4 pb-6">
      <Text className="text-base text-textSecondary">{getGreeting()},</Text>
      <Text className="text-2xl font-bold text-textPrimary mb-5">
        {userName}
      </Text>
      <Text className="text-sm text-textSecondary mb-1">Tu balance total</Text>
      <Text className="text-4xl font-semibold text-textPrimary">
        {formatCurrency(totalBalance)}
      </Text>
    </View>
  );
}
