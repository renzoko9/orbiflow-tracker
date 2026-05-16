import { Text, View } from "react-native";
import { formatCurrency } from "@/shared/i18n";

interface AccountsHeaderProps {
  totalBalance: number;
  accountCount: number;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function AccountsHeader({
  totalBalance,
  accountCount,
}: AccountsHeaderProps) {
  return (
    <View className="px-5 pt-6 pb-6">
      <Text
        className="text-[11px] font-sans-bold uppercase text-textDisabled mb-2"
        style={{ letterSpacing: 0.4 }}
      >
        Patrimonio total
      </Text>
      <Text
        className="text-[44px] font-display-bold text-textPrimary"
        style={[{ lineHeight: 56, includeFontPadding: false }, tabular]}
      >
        {formatCurrency(totalBalance)}
      </Text>
      <Text className="text-sm text-textTertiary mt-2">
        {accountCount === 0
          ? "Aun no tienes cuentas"
          : `Distribuido en ${accountCount} ${
              accountCount === 1 ? "cuenta" : "cuentas"
            }`}
      </Text>
    </View>
  );
}
