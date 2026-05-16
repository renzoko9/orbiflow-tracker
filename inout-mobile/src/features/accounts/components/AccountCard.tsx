import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/shared/ui";
import { formatCurrency, formatPercent } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";

interface AccountCardProps {
  name: string;
  balance: string;
  description: string | null;
  icon: string;
  color: string;
  sharePercent?: number;
  onPress?: () => void;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function AccountCard({
  name,
  balance,
  description,
  icon,
  color,
  sharePercent,
  onPress,
}: AccountCardProps) {
  const Icon = getIconComponent(icon);

  const microcopy = [
    description?.trim() ? description.trim() : null,
    sharePercent !== undefined && sharePercent > 0
      ? `${formatPercent(sharePercent)} del total`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const content = (
    <View className="flex-row items-center">
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: color + "1F" }}
      >
        <Icon size={22} color={color} />
      </View>

      <View className="flex-1 mr-3">
        <Text
          className="text-[15px] font-sans-semibold text-textPrimary"
          numberOfLines={1}
        >
          {name}
        </Text>
        {microcopy ? (
          <Text
            className="text-[10px] uppercase text-textTertiary mt-1"
            style={{ letterSpacing: 0.6 }}
            numberOfLines={1}
          >
            {microcopy}
          </Text>
        ) : null}
      </View>

      <Text
        className="text-lg font-display-bold text-textPrimary"
        style={[{ includeFontPadding: false }, tabular]}
      >
        {formatCurrency(balance)}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card>{content}</Card>
      </TouchableOpacity>
    );
  }

  return <Card>{content}</Card>;
}
