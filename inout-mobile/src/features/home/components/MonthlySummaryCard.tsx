import { Text, View } from "react-native";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import { Card } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";

interface MonthlySummaryCardProps {
  monthName: string;
  income: number;
  expenses: number;
  previousNet?: number;
}

export function MonthlySummaryCard({
  monthName,
  income,
  expenses,
  previousNet,
}: MonthlySummaryCardProps) {
  const tokens = useThemeTokens();
  const net = income - expenses;
  const showComparison = previousNet !== undefined && previousNet !== 0;
  const change = showComparison
    ? ((net - (previousNet ?? 0)) / Math.abs(previousNet ?? 1)) * 100
    : 0;
  const isPositive = change >= 0;

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-semibold text-textPrimary">
          {monthName}
        </Text>
        {showComparison && (
          <View className="flex-row items-center gap-1">
            {isPositive ? (
              <TrendingUp size={14} color={tokens.success} />
            ) : (
              <TrendingDown size={14} color={tokens.danger} />
            )}
            <Text
              className={`text-xs font-medium ${
                isPositive ? "text-success" : "text-danger"
              }`}
            >
              {Math.abs(change).toFixed(0)}% vs mes anterior
            </Text>
          </View>
        )}
      </View>

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
          <Text
            className={`text-base font-semibold ${
              net >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatCurrency(net)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
