import { Text, View } from "react-native";
import { Card } from "@/shared/ui";
import { formatPercent } from "@/shared/i18n";
import type { Account } from "../model";

interface AccountsDistributionCardProps {
  accounts: Account[];
}

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
      percentage: (Math.abs(Number(acc.balance)) / totalAbs) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-textPrimary mb-2">
        Distribucion del balance
      </Text>
      <Card>
        <View className="h-2.5 rounded-full bg-surfaceMuted overflow-hidden flex-row mb-4">
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
                className="flex-1 text-sm text-textPrimary"
                numberOfLines={1}
              >
                {seg.name}
              </Text>
              <Text className="text-sm font-medium text-textPrimary">
                {formatPercent(seg.percentage)}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}
