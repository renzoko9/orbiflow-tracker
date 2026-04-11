import { View, Text } from "react-native";

interface AccountBalanceSummaryProps {
  totalBalance: number;
}

export function AccountBalanceSummary({
  totalBalance,
}: AccountBalanceSummaryProps) {
  return (
    <View className="items-center py-6">
      <Text className="text-sm text-subordinary mb-1">Balance General</Text>
      <Text className="text-4xl font-semibold text-base-color">
        S/ {totalBalance.toFixed(2)}
      </Text>
    </View>
  );
}
