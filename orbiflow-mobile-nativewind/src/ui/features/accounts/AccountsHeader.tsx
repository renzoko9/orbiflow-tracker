import { View, Text } from "react-native";

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
      <Text className="text-sm text-subordinary mb-1">Balance total</Text>
      <Text className="text-4xl font-semibold text-base-color">
        S/ {totalBalance.toFixed(2)}
      </Text>
      <Text className="text-sm text-subordinary mt-2">
        {accountCount === 0
          ? "Sin cuentas registradas"
          : `Distribuido en ${accountCount} ${accountCount === 1 ? "cuenta" : "cuentas"}`}
      </Text>
    </View>
  );
}
