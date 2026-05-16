import { Text, View } from "react-native";
import { formatCurrency } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";

interface AccountHeroProps {
  name: string;
  balance: string;
  description: string | null;
  icon: string;
  color: string;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function AccountHero({
  name,
  balance,
  description,
  icon,
  color,
}: AccountHeroProps) {
  const Icon = getIconComponent(icon);

  return (
    <View className="px-5 pt-2 pb-8">
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
        style={{ backgroundColor: color + "1F" }}
      >
        <Icon size={28} color={color} />
      </View>

      <Text
        className="text-[10px] font-sans-bold uppercase text-textTertiary mb-2"
        style={{ letterSpacing: 1.2 }}
      >
        Cuenta
      </Text>

      <Text
        className="text-3xl font-sans-extrabold text-textPrimary"
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text
        className="text-[44px] font-display-bold text-textPrimary mt-3"
        style={[{ lineHeight: 56, includeFontPadding: false }, tabular]}
      >
        {formatCurrency(balance)}
      </Text>

      {description ? (
        <Text
          className="text-base font-sans-medium text-textSecondary mt-2"
          numberOfLines={3}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}
