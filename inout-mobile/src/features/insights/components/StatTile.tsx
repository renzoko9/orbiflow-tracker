import { Text, View } from "react-native";
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";

interface StatTileProps {
  label: string;
  amount: number;
  valueClassName?: string;
  deltaPercent?: number | null;
  /** true cuando subir es bueno (ingresos); false cuando subir es malo (gastos) */
  higherIsBetter?: boolean;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function StatTile({
  label,
  amount,
  valueClassName = "text-textPrimary",
  deltaPercent,
  higherIsBetter = true,
}: StatTileProps) {
  const tokens = useThemeTokens();
  const hasDelta =
    deltaPercent !== undefined &&
    deltaPercent !== null &&
    Math.abs(deltaPercent) >= 1;
  const up = (deltaPercent ?? 0) >= 0;
  const isGood = up === higherIsBetter;
  const deltaColor = isGood ? tokens.success : tokens.danger;
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
      <Text
        className="text-[10px] font-sans-bold uppercase text-textTertiary"
        style={{ letterSpacing: 0.4 }}
      >
        {label}
      </Text>
      <Text
        className={`text-lg font-display-bold mt-1.5 ${valueClassName}`}
        style={tabular}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatCurrency(amount)}
      </Text>
      {hasDelta ? (
        <View className="flex-row items-center gap-0.5 mt-1.5">
          <DeltaIcon size={12} color={deltaColor} strokeWidth={2.6} />
          <Text
            className="text-[11px] font-sans-semibold"
            style={[{ color: deltaColor }, tabular]}
          >
            {Math.abs(deltaPercent ?? 0).toFixed(0)}%
          </Text>
          <Text className="text-[11px] text-textTertiary"> vs mes ant.</Text>
        </View>
      ) : (
        <Text className="text-[11px] text-textTertiary mt-1.5">
          Sin comparativa
        </Text>
      )}
    </View>
  );
}
