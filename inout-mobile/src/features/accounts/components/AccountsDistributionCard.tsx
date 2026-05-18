import { Text, View } from "react-native";
import { Card, SectionEyebrow } from "@/shared/ui";
import { formatPercent } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";
import type { Account } from "../model";

interface AccountsDistributionCardProps {
  accounts: Account[];
}

const tabular = { fontVariant: ["tabular-nums" as const] };

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
      icon: acc.icon,
      percentage: (Math.abs(Number(acc.balance)) / totalAbs) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <View className="mb-4">
      <SectionEyebrow label="Distribucion" />
      <Card>
        <View className="h-8 rounded-md bg-surfaceMuted overflow-hidden flex-row mb-5">
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

        <View className="gap-3">
          {segments.map((seg) => {
            const Icon = getIconComponent(seg.icon);
            return (
              <View key={seg.id} className="flex-row items-center">
                <View
                  className="w-7 h-7 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: seg.color + "1F" }}
                >
                  <Icon size={14} color={seg.color} />
                </View>
                <Text
                  className="flex-1 text-sm font-sans-medium text-textPrimary"
                  numberOfLines={1}
                >
                  {seg.name}
                </Text>
                <Text
                  className="text-sm font-display-semibold text-textPrimary"
                  style={tabular}
                >
                  {formatPercent(seg.percentage)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>
    </View>
  );
}
