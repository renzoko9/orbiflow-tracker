import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";
import { SectionEyebrow } from "@/shared/ui";

interface SavingsRateCardProps {
  savingsRate: number;
  net: number;
  projectedNet: number;
  daysRemaining: number;
}

const RING_SIZE = 104;
const STROKE = 10;
const tabular = { fontVariant: ["tabular-nums" as const] };

/**
 * Hero del dashboard: anillo de tasa de ahorro del mes.
 * La tasa de ahorro (neto / ingresos) es la metrica firma de finanzas
 * personales, por eso ocupa el lugar destacado.
 */
export function SavingsRateCard({
  savingsRate,
  net,
  projectedNet,
  daysRemaining,
}: SavingsRateCardProps) {
  const tokens = useThemeTokens();
  const radius = (RING_SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(savingsRate, 100));
  const dash = (clamped / 100) * circumference;
  const isPositive = net >= 0;
  const ringColor = isPositive ? tokens.success : tokens.danger;

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      <SectionEyebrow label="Tasa de ahorro · Este mes" />
      <View className="flex-row items-center gap-5">
        <View
          style={{ width: RING_SIZE, height: RING_SIZE }}
          className="items-center justify-center"
        >
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              stroke={tokens.surfaceMuted}
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              stroke={ringColor}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View className="absolute items-center">
            <Text
              className="text-2xl font-display-bold text-textPrimary"
              style={tabular}
            >
              {Math.round(savingsRate)}%
            </Text>
          </View>
        </View>

        <View className="flex-1">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={{ letterSpacing: 0.4 }}
          >
            Balance neto
          </Text>
          <Text
            className={`text-2xl font-display-bold mt-1 ${
              isPositive ? "text-textPrimary" : "text-danger"
            }`}
            style={tabular}
          >
            {isPositive ? "+" : "−"}
            {formatCurrency(Math.abs(net))}
          </Text>
          <Text className="text-xs text-textSecondary leading-5 mt-2">
            {daysRemaining > 0
              ? `Proyectado a fin de mes: ${formatCurrency(projectedNet)}`
              : "Mes cerrado"}
          </Text>
        </View>
      </View>
    </View>
  );
}
