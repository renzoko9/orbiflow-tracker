import { View, Text } from "react-native";

interface AccountMonthStatsProps {
  monthName: string;
  income: number;
  expenses: number;
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export function AccountMonthStats({
  monthName,
  income,
  expenses,
}: AccountMonthStatsProps) {
  const net = income - expenses;
  const sign = net >= 0 ? "+" : "";

  return (
    <View
      className="rounded-2xl px-4 py-4 bg-background-light mb-4"
      style={cardShadow}
    >
      <Text className="text-base font-semibold text-text-light mb-3">
        {monthName}
      </Text>

      <View className="flex-row">
        <View className="flex-1 items-center">
          <Text className="text-xs text-subordinary mb-1">Ingresos</Text>
          <Text className="text-base font-semibold text-success-medium">
            S/ {income.toFixed(2)}
          </Text>
        </View>
        <View className="w-px bg-primary-1" />
        <View className="flex-1 items-center">
          <Text className="text-xs text-subordinary mb-1">Gastos</Text>
          <Text className="text-base font-semibold text-error-medium">
            S/ {expenses.toFixed(2)}
          </Text>
        </View>
        <View className="w-px bg-primary-1" />
        <View className="flex-1 items-center">
          <Text className="text-xs text-subordinary mb-1">Neto</Text>
          <Text
            className={`text-base font-semibold ${
              net >= 0 ? "text-success-medium" : "text-error-medium"
            }`}
          >
            {sign}S/ {net.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
