import { Text, View } from "react-native";
import { formatCurrency } from "@/shared/i18n";

interface AccountsHeaderProps {
  totalBalance: number;
  accountCount: number;
}

export function AccountsHeader({
  totalBalance,
  accountCount,
}: AccountsHeaderProps) {
  return (
    <View className="px-4 pt-4 pb-6">
      <Text className="text-sm text-textSecondary mb-1">Balance total</Text>
      <Text className="text-4xl font-semibold text-textPrimary">
        {formatCurrency(totalBalance)}
      </Text>
      <Text className="text-sm text-textSecondary mt-2">
        {accountCount === 0
          ? "Sin cuentas registradas"
          : `Distribuido en ${accountCount} ${
              accountCount === 1 ? "cuenta" : "cuentas"
            }`}
      </Text>
    </View>
  );
}
