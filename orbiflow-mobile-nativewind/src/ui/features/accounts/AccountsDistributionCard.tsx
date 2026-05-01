import { View, Text } from "react-native";
import { Account } from "@/src/core/dto/account.interface";

interface AccountsDistributionCardProps {
  accounts: Account[];
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export function AccountsDistributionCard({
  accounts,
}: AccountsDistributionCardProps) {
  if (accounts.length < 2) return null;

  const totalAbs = accounts.reduce(
    (sum, acc) => sum + Math.abs(Number(acc.balance)),
    0,
  );

  if (totalAbs === 0) return null;

  const segments = accounts
    .map((acc) => ({
      id: acc.id,
      name: acc.name,
      color: acc.color,
      balance: Number(acc.balance),
      percentage: (Math.abs(Number(acc.balance)) / totalAbs) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-text-light mb-2">
        Distribución del balance
      </Text>
      <View
        className="rounded-2xl bg-background-light px-4 py-4"
        style={cardShadow}
      >
        <View className="h-2.5 rounded-full bg-primary-1 overflow-hidden flex-row mb-4">
          {segments.map((seg) => (
            <View
              key={seg.id}
              style={{
                width: `${seg.percentage}%`,
                backgroundColor: seg.color,
              }}
            />
          ))}
        </View>

        <View className="gap-2">
          {segments.map((seg) => (
            <View key={seg.id} className="flex-row items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mr-2"
                style={{ backgroundColor: seg.color }}
              />
              <Text
                className="flex-1 text-sm text-text-light"
                numberOfLines={1}
              >
                {seg.name}
              </Text>
              <Text className="text-sm font-medium text-text-light">
                {seg.percentage.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
