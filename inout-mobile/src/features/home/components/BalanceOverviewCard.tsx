import { Text, View } from "react-native";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";

interface BalanceOverviewCardProps {
  totalBalance: number;
  income: number;
  expenses: number;
  previousNet?: number;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function BalanceOverviewCard({
  totalBalance,
  income,
  expenses,
  previousNet,
}: BalanceOverviewCardProps) {
  const tokens = useThemeTokens();
  const net = income - expenses;
  const showComparison = previousNet !== undefined && previousNet !== 0;
  const change = showComparison
    ? ((net - (previousNet ?? 0)) / Math.abs(previousNet ?? 1)) * 100
    : 0;
  const isPositive = change >= 0;

  return (
    <View className="rounded-2xl bg-brandStrong p-6 mx-5 mb-8">
      <Text
        className="text-[11px] font-bold text-textInverse/60 uppercase"
        style={{ letterSpacing: 1.2 }}
      >
        Balance total
      </Text>
      <Text
        className="text-[36px] font-extrabold text-textInverse mt-2"
        style={[{ letterSpacing: -1.2, lineHeight: 40 }, tabular]}
      >
        {formatCurrency(totalBalance)}
      </Text>

      {showComparison && (
        <View className="flex-row items-center gap-1.5 mt-3">
          {isPositive ? (
            <TrendingUp size={14} color={tokens.success} />
          ) : (
            <TrendingDown size={14} color={tokens.danger} />
          )}
          <Text
            className={`text-xs font-semibold ${
              isPositive ? "text-success" : "text-danger"
            }`}
            style={tabular}
          >
            {isPositive ? "+" : "−"}
            {Math.abs(change).toFixed(0)}% vs mes anterior
          </Text>
        </View>
      )}

      <View className="h-px bg-white/15 my-5" />

      <View className="flex-row">
        <View className="flex-1">
          <Text
            className="text-[10px] font-bold text-textInverse/60 uppercase"
            style={{ letterSpacing: 1.2 }}
          >
            Ingresos
          </Text>
          <Text
            className="text-base font-bold text-success mt-1.5"
            style={tabular}
          >
            {formatCurrency(income)}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-[10px] font-bold text-textInverse/60 uppercase"
            style={{ letterSpacing: 1.2 }}
          >
            Gastos
          </Text>
          <Text
            className="text-base font-bold text-danger mt-1.5"
            style={tabular}
          >
            {formatCurrency(expenses)}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-[10px] font-bold text-textInverse/60 uppercase"
            style={{ letterSpacing: 1.2 }}
          >
            Neto
          </Text>
          <Text
            className={`text-base font-bold mt-1.5 ${
              net >= 0 ? "text-textInverse" : "text-danger"
            }`}
            style={tabular}
          >
            {net >= 0 ? "+" : ""}
            {formatCurrency(net)}
          </Text>
        </View>
      </View>
    </View>
  );
}
