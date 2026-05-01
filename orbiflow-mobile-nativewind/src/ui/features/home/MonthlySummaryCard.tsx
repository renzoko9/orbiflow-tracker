import { View, Text } from "react-native";
import { TrendingUp, TrendingDown } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

interface MonthlySummaryCardProps {
  monthName: string;
  income: number;
  expenses: number;
  previousNet?: number;
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export function MonthlySummaryCard({
  monthName,
  income,
  expenses,
  previousNet,
}: MonthlySummaryCardProps) {
  const net = income - expenses;
  const showComparison = previousNet !== undefined && previousNet !== 0;
  const change = showComparison
    ? ((net - previousNet!) / Math.abs(previousNet!)) * 100
    : 0;
  const isPositive = change >= 0;

  return (
    <View
      className="rounded-2xl px-4 py-4 bg-background-light mb-4"
      style={cardShadow}
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-semibold text-text-light">
          {monthName}
        </Text>
        {showComparison && (
          <View className="flex-row items-center gap-1">
            {isPositive ? (
              <TrendingUp size={14} color={colors.success.medium} />
            ) : (
              <TrendingDown size={14} color={colors.error.medium} />
            )}
            <Text
              className={`text-xs font-medium ${
                isPositive ? "text-success-medium" : "text-error-medium"
              }`}
            >
              {Math.abs(change).toFixed(0)}% vs mes anterior
            </Text>
          </View>
        )}
      </View>

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
            S/ {net.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
