import { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";
import { SectionEyebrow, SegmentedControl } from "@/shared/ui";
import type { CategoryStat } from "../model";

interface CategoryBreakdownCardProps {
  expenseCategories: CategoryStat[];
  incomeCategories: CategoryStat[];
  expenseTotal: number;
  incomeTotal: number;
}

type BreakdownType = "expense" | "income";

const DONUT_SIZE = 132;
const STROKE = 16;
const tabular = { fontVariant: ["tabular-nums" as const] };

const TYPE_OPTIONS: { value: BreakdownType; label: string }[] = [
  { value: "expense", label: "Gastos" },
  { value: "income", label: "Ingresos" },
];

/**
 * Desglose por categoria del periodo, conmutable entre gastos e ingresos.
 * Donut SVG + lista completa con monto, # de movimientos, % y variacion.
 */
export function CategoryBreakdownCard({
  expenseCategories,
  incomeCategories,
  expenseTotal,
  incomeTotal,
}: CategoryBreakdownCardProps) {
  const tokens = useThemeTokens();
  const [type, setType] = useState<BreakdownType>("expense");

  const categories = type === "expense" ? expenseCategories : incomeCategories;
  const total = type === "expense" ? expenseTotal : incomeTotal;
  // En gastos, subir es malo; en ingresos, subir es bueno.
  const higherIsBetter = type === "income";

  const radius = (DONUT_SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = categories.map((cat) => {
    const fraction = total > 0 ? Math.min(cat.amount / total, 1) : 0;
    const dash = fraction * circumference;
    const segment = { color: cat.color, dash, offset };
    offset += dash;
    return segment;
  });

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      <SectionEyebrow label="Desglose por categoria" />

      <SegmentedControl
        options={TYPE_OPTIONS}
        value={type}
        onChange={setType}
        className="mb-4"
      />

      {categories.length === 0 ? (
        <Text className="text-sm text-textSecondary leading-5 py-2">
          Sin {type === "expense" ? "gastos" : "ingresos"} en este periodo.
        </Text>
      ) : (
        <>
          <View className="flex-row items-center gap-5 mb-4">
            <View
              style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
              className="items-center justify-center"
            >
              <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
                <G transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}>
                  <Circle
                    cx={DONUT_SIZE / 2}
                    cy={DONUT_SIZE / 2}
                    r={radius}
                    stroke={tokens.surfaceMuted}
                    strokeWidth={STROKE}
                    fill="none"
                  />
                  {segments.map((seg, i) => (
                    <Circle
                      key={i}
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={radius}
                      stroke={seg.color}
                      strokeWidth={STROKE}
                      fill="none"
                      strokeDasharray={`${seg.dash} ${circumference}`}
                      strokeDashoffset={-seg.offset}
                    />
                  ))}
                </G>
              </Svg>
              <View className="absolute items-center">
                <Text
                  className="text-[9px] font-sans-bold uppercase text-textTertiary"
                  style={{ letterSpacing: 0.4 }}
                >
                  {type === "expense" ? "Gasto" : "Ingreso"}
                </Text>
                <Text
                  className="text-sm font-display-bold text-textPrimary"
                  style={tabular}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatCurrency(total)}
                </Text>
              </View>
            </View>

            <View className="flex-1 gap-1.5">
              {categories.slice(0, 4).map((cat) => (
                <View key={cat.name} className="flex-row items-center gap-2">
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: cat.color,
                    }}
                  />
                  <Text
                    className="text-[13px] font-sans-medium text-textPrimary flex-1"
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                  <Text
                    className="text-[11px] text-textTertiary"
                    style={tabular}
                  >
                    {cat.percentage.toFixed(0)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-3 pt-1">
            {categories.map((cat) => (
              <CategoryRow
                key={cat.name}
                category={cat}
                higherIsBetter={higherIsBetter}
                tokens={tokens}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function CategoryRow({
  category,
  higherIsBetter,
  tokens,
}: {
  category: CategoryStat;
  higherIsBetter: boolean;
  tokens: ReturnType<typeof useThemeTokens>;
}) {
  const hasDelta =
    category.deltaPercent !== null && Math.abs(category.deltaPercent) >= 1;
  const up = (category.deltaPercent ?? 0) >= 0;
  const isGood = up === higherIsBetter;
  const deltaColor = isGood ? tokens.success : tokens.danger;
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <View className="flex-row items-center gap-3">
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: category.color,
        }}
      />
      <View className="flex-1">
        <Text
          className="text-sm font-sans-semibold text-textPrimary"
          numberOfLines={1}
        >
          {category.name}
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <Text className="text-[11px] text-textTertiary" style={tabular}>
            {category.count} mov · {category.percentage.toFixed(0)}%
          </Text>
          {hasDelta && (
            <View className="flex-row items-center gap-0.5">
              <DeltaIcon size={11} color={deltaColor} strokeWidth={2.6} />
              <Text
                className="text-[10px] font-sans-semibold"
                style={[{ color: deltaColor }, tabular]}
              >
                {Math.abs(category.deltaPercent ?? 0).toFixed(0)}%
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text
        className="text-sm font-display-bold text-textPrimary"
        style={tabular}
      >
        {formatCurrency(category.amount)}
      </Text>
    </View>
  );
}
