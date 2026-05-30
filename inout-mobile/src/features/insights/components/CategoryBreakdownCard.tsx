import { Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";
import { SectionEyebrow } from "@/shared/ui";
import type { CategoryStat } from "../model";

interface CategoryBreakdownCardProps {
  categories: CategoryStat[];
  totalExpense: number;
}

const DONUT_SIZE = 132;
const STROKE = 16;
const tabular = { fontVariant: ["tabular-nums" as const] };

/**
 * Distribucion de gastos del mes: donut SVG con el top de categorias
 * y una lista con monto, porcentaje y variacion vs mes anterior.
 * El track de fondo representa el remanente ("otras categorias").
 */
export function CategoryBreakdownCard({
  categories,
  totalExpense,
}: CategoryBreakdownCardProps) {
  const tokens = useThemeTokens();
  const radius = (DONUT_SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = categories.map((cat) => {
    const fraction =
      totalExpense > 0 ? Math.min(cat.amount / totalExpense, 1) : 0;
    const dash = fraction * circumference;
    const segment = {
      color: cat.color,
      dash,
      offset,
    };
    offset += dash;
    return segment;
  });

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      <SectionEyebrow label="En que gastas · Este mes" />

      <View className="flex-row items-center gap-5">
        <View
          style={{ width: DONUT_SIZE, height: DONUT_SIZE }}
          className="items-center justify-center"
        >
          <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
            <G
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
            >
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
              Gasto
            </Text>
            <Text
              className="text-sm font-display-bold text-textPrimary"
              style={tabular}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        <View className="flex-1 gap-2.5">
          {categories.map((cat) => (
            <CategoryRow key={cat.name} category={cat} tokens={tokens} />
          ))}
        </View>
      </View>
    </View>
  );
}

function CategoryRow({
  category,
  tokens,
}: {
  category: CategoryStat;
  tokens: ReturnType<typeof useThemeTokens>;
}) {
  const hasDelta =
    category.deltaPercent !== null && Math.abs(category.deltaPercent) >= 1;
  const up = (category.deltaPercent ?? 0) >= 0;
  // En gastos, subir es malo.
  const deltaColor = up ? tokens.danger : tokens.success;
  const DeltaIcon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <View className="flex-row items-center gap-2">
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: category.color,
        }}
      />
      <Text
        className="text-[13px] font-sans-medium text-textPrimary flex-1"
        numberOfLines={1}
      >
        {category.name}
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
      <Text
        className="text-[10px] text-textTertiary w-9 text-right"
        style={tabular}
      >
        {category.percentage.toFixed(0)}%
      </Text>
    </View>
  );
}
