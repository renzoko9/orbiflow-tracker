import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";
import { SectionEyebrow } from "@/shared/ui";
import type { PeriodSummary, PreviousPeriod, ProjectionStats } from "../model";

interface PeriodSummaryCardProps {
  label: string;
  summary: PeriodSummary;
  previous: PreviousPeriod | null;
  projection: ProjectionStats | null;
}

const RING_SIZE = 96;
const STROKE = 10;
const tabular = { fontVariant: ["tabular-nums" as const] };

/**
 * Resumen del periodo: anillo de tasa de ahorro + balance neto, y debajo
 * ingresos/gastos con su variacion vs el periodo anterior.
 */
export function PeriodSummaryCard({
  label,
  summary,
  previous,
  projection,
}: PeriodSummaryCardProps) {
  const tokens = useThemeTokens();
  const radius = (RING_SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(summary.savingsRate, 100));
  const dash = (clamped / 100) * circumference;
  const isPositive = summary.net >= 0;
  const ringColor = isPositive ? tokens.success : tokens.danger;

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      <SectionEyebrow label={`Resumen · ${label}`} />

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
              className="text-xl font-display-bold text-textPrimary"
              style={tabular}
            >
              {Math.round(summary.savingsRate)}%
            </Text>
            <Text
              className="text-[9px] font-sans-bold uppercase text-textTertiary"
              style={{ letterSpacing: 0.4 }}
            >
              ahorro
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
            {formatCurrency(Math.abs(summary.net))}
          </Text>
          {previous ? (
            <Delta
              percent={previous.netDeltaPercent}
              higherIsBetter
              tokens={tokens}
              suffix={`vs ${previous.label}`}
            />
          ) : (
            <Text className="text-[11px] text-textTertiary mt-1">
              Sin comparativa
            </Text>
          )}
          {projection ? (
            <Text className="text-xs text-textSecondary leading-5 mt-2">
              Proyectado a fin de mes: {formatCurrency(projection.net)}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="h-px bg-border my-4" />

      <View className="flex-row">
        <Metric
          label="Ingresos"
          amount={summary.income}
          valueClassName="text-success"
          percent={previous?.incomeDeltaPercent ?? null}
          higherIsBetter
          tokens={tokens}
        />
        <View className="w-px bg-border mx-2" />
        <Metric
          label="Gastos"
          amount={summary.expense}
          valueClassName="text-danger"
          percent={previous?.expenseDeltaPercent ?? null}
          higherIsBetter={false}
          tokens={tokens}
        />
      </View>
    </View>
  );
}

function Metric({
  label,
  amount,
  valueClassName,
  percent,
  higherIsBetter,
  tokens,
}: {
  label: string;
  amount: number;
  valueClassName: string;
  percent: number | null;
  higherIsBetter: boolean;
  tokens: ReturnType<typeof useThemeTokens>;
}) {
  return (
    <View className="flex-1">
      <Text
        className="text-[10px] font-sans-bold uppercase text-textTertiary"
        style={{ letterSpacing: 0.4 }}
      >
        {label}
      </Text>
      <Text
        className={`text-lg font-display-bold mt-1 ${valueClassName}`}
        style={tabular}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatCurrency(amount)}
      </Text>
      <Delta percent={percent} higherIsBetter={higherIsBetter} tokens={tokens} />
    </View>
  );
}

function Delta({
  percent,
  higherIsBetter,
  tokens,
  suffix = "vs ant.",
}: {
  percent: number | null;
  higherIsBetter: boolean;
  tokens: ReturnType<typeof useThemeTokens>;
  suffix?: string;
}) {
  const hasDelta = percent !== null && Math.abs(percent) >= 1;
  if (!hasDelta) {
    return (
      <Text className="text-[11px] text-textTertiary mt-1">Sin comparativa</Text>
    );
  }
  const up = (percent ?? 0) >= 0;
  const isGood = up === higherIsBetter;
  const color = isGood ? tokens.success : tokens.danger;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <View className="flex-row items-center gap-0.5 mt-1">
      <Icon size={12} color={color} strokeWidth={2.6} />
      <Text
        className="text-[11px] font-sans-semibold"
        style={[{ color }, tabular]}
      >
        {Math.abs(percent ?? 0).toFixed(0)}%
      </Text>
      <Text className="text-[11px] text-textTertiary"> {suffix}</Text>
    </View>
  );
}
