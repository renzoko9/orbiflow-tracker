import { Text, View } from "react-native";
import { formatCurrency } from "@/shared/i18n";

interface AccountMonthStatsProps {
  monthName: string;
  income: number;
  expenses: number;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function AccountMonthStats({
  monthName,
  income,
  expenses,
}: AccountMonthStatsProps) {
  const net = income - expenses;
  const netClass = net >= 0 ? "text-success" : "text-danger";
  const netSign = net > 0 ? "+ " : net < 0 ? "− " : "";

  return (
    <View className="mb-4">
      <Text
        className="text-[10px] font-sans-bold uppercase text-textTertiary"
        style={{ letterSpacing: 1.2 }}
      >
        Este mes
      </Text>
      <Text className="text-xl font-sans-extrabold text-textPrimary mt-1 mb-4">
        {monthName}
      </Text>

      <View className="flex-row">
        <View className="flex-1">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={{ letterSpacing: 0.6 }}
          >
            Ingresos
          </Text>
          <Text
            className="text-lg font-display-bold text-success mt-1"
            style={[{ includeFontPadding: false }, tabular]}
          >
            {formatCurrency(income)}
          </Text>
        </View>
        <View className="w-px bg-border mx-3" />
        <View className="flex-1">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={{ letterSpacing: 0.6 }}
          >
            Gastos
          </Text>
          <Text
            className="text-lg font-display-bold text-danger mt-1"
            style={[{ includeFontPadding: false }, tabular]}
          >
            {formatCurrency(expenses)}
          </Text>
        </View>
        <View className="w-px bg-border mx-3" />
        <View className="flex-1">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={{ letterSpacing: 0.6 }}
          >
            Neto
          </Text>
          <Text
            className={`text-lg font-display-bold mt-1 ${netClass}`}
            style={[{ includeFontPadding: false }, tabular]}
          >
            {netSign}
            {formatCurrency(Math.abs(net))}
          </Text>
        </View>
      </View>
    </View>
  );
}
