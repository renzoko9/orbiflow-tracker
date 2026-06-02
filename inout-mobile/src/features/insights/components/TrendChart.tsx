import { useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import Svg, { G, Rect, Text as SvgText } from "react-native-svg";
import { useThemeTokens } from "@/shared/theme";
import { SectionEyebrow } from "@/shared/ui";
import type { TrendPoint } from "../model";

interface TrendChartProps {
  data: TrendPoint[];
  label?: string;
}

const CHART_HEIGHT = 150;
const LABEL_AREA = 22;
const BAR_GAP = 3;

/**
 * Tendencia de ingresos vs gastos por mes (6 o 12 barras agrupadas).
 * El ancho se mide con onLayout para escalar bien en cualquier pantalla.
 */
export function TrendChart({
  data,
  label = "Ingresos vs gastos",
}: TrendChartProps) {
  const tokens = useThemeTokens();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d.income, d.expense)),
  );
  const plotHeight = CHART_HEIGHT - LABEL_AREA;
  const groupWidth = width > 0 ? width / data.length : 0;
  const barWidth = Math.max(4, (groupWidth - BAR_GAP) / 2 - 3);
  const labelFontSize = data.length > 6 ? 9 : 10;

  return (
    <View className="bg-surface rounded-2xl p-5 border border-border">
      <SectionEyebrow label={label} />

      <View className="flex-row items-center gap-4 mb-3">
        <Legend color={tokens.success} label="Ingresos" />
        <Legend color={tokens.danger} label="Gastos" />
      </View>

      <View onLayout={onLayout}>
        {width > 0 && (
          <Svg width={width} height={CHART_HEIGHT}>
            {data.map((point, i) => {
              const groupX = i * groupWidth + groupWidth / 2;
              const incomeH = (point.income / maxValue) * plotHeight;
              const expenseH = (point.expense / maxValue) * plotHeight;
              const incomeX = groupX - barWidth - BAR_GAP / 2;
              const expenseX = groupX + BAR_GAP / 2;
              return (
                <G key={point.period}>
                  <Rect
                    x={incomeX}
                    y={plotHeight - incomeH}
                    width={barWidth}
                    height={incomeH}
                    rx={3}
                    fill={tokens.success}
                  />
                  <Rect
                    x={expenseX}
                    y={plotHeight - expenseH}
                    width={barWidth}
                    height={expenseH}
                    rx={3}
                    fill={tokens.danger}
                  />
                  <SvgText
                    x={groupX}
                    y={CHART_HEIGHT - 6}
                    fontSize={labelFontSize}
                    fontWeight="600"
                    fill={tokens.textTertiary}
                    textAnchor="middle"
                  >
                    {point.label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        )}
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }}
      />
      <Text className="text-[11px] font-sans-medium text-textSecondary">
        {label}
      </Text>
    </View>
  );
}
