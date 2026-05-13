import { Text, View } from "react-native";
import { Card } from "@/shared/ui";
import { formatCurrency } from "@/shared/i18n";

interface AccountMonthStatsProps {
  monthName: string;
  income: number;
  expenses: number;
}

export function AccountMonthStats({
  monthName,
  income,
  expenses,
}: AccountMonthStatsProps) {
  const net = income - expenses;
  const netClass = net >= 0 ? "text-success" : "text-danger";

  return (
    <Card className="mb-4">
      <Text className="text-base font-semibold text-textPrimary mb-3">
        {monthName}
      </Text>

      <View className="flex-row">
        <View className="flex-1 items-center">
          <Text className="text-xs text-textSecondary mb-1">Ingresos</Text>
          <Text className="text-base font-semibold text-success">
            {formatCurrency(income)}
          </Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-xs text-textSecondary mb-1">Gastos</Text>
          <Text className="text-base font-semibold text-danger">
            {formatCurrency(expenses)}
          </Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center">
          <Text className="text-xs text-textSecondary mb-1">Neto</Text>
          <Text className={`text-base font-semibold ${netClass}`}>
            {net >= 0 ? "+" : ""}
            {formatCurrency(net)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
