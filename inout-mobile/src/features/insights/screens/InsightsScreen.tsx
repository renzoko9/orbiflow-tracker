import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { CalendarOff, Sparkles } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { Loading } from "@/shared/ui";
import {
  AIInsightsCard,
  CategoryBreakdownCard,
  PeriodSelector,
  PeriodSummaryCard,
  TrendChart,
} from "../components";
import { useInsightStats, useMonthlyInsight } from "../api";

export function InsightsScreen() {
  const tokens = useThemeTokens();
  const tabBarHeight = useBottomTabBarHeight();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState<number | null>(now.getMonth() + 1);

  const { data: stats, isLoading } = useInsightStats({ year, month });

  // La nota de cierre solo aplica a un mes ya concluido (pasado), nunca al
  // mes en curso ni a la vista anual.
  const isConcludedMonth =
    month != null &&
    (year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1));

  const noteEnabled = isConcludedMonth && stats?.hasData === true;

  const { data: insight, isLoading: insightLoading } = useMonthlyInsight(
    { year, month },
    { enabled: noteEnabled },
  );

  const showOtto = noteEnabled && (insightLoading || insight?.available);

  const trendLabel =
    stats?.granularity === "year"
      ? `Ingresos vs gastos · ${stats.year}`
      : "Ingresos vs gastos · 6 meses";

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <View className="px-5 pt-6 pb-4">
        <Text
          className="text-[11px] font-sans-bold uppercase text-textDisabled mb-1"
          style={{ letterSpacing: 0.4 }}
        >
          Resumen
        </Text>
        <Text className="text-3xl font-sans-extrabold text-textPrimary">
          Insights
        </Text>
      </View>

      {stats ? (
        <View className="px-5 pb-3">
          <PeriodSelector
            year={year}
            month={month}
            availableYears={stats.availableYears}
            onChange={(y, m) => {
              setYear(y);
              setMonth(m);
            }}
          />
        </View>
      ) : null}

      {isLoading && !stats ? (
        <Loading />
      ) : !stats || !stats.hasHistory ? (
        <View className="px-5">
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={14} color={tokens.textTertiary} />
              <Text
                className="text-[10px] font-sans-bold text-textTertiary uppercase"
                style={{ letterSpacing: 1.5 }}
              >
                Sin datos aun
              </Text>
            </View>
            <Text className="text-base font-sans-semibold text-textPrimary mb-1">
              Aun no hay movimientos
            </Text>
            <Text className="text-sm text-textSecondary leading-5">
              Registra ingresos y gastos para ver tus estadisticas y tendencias.
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: tabBarHeight + 32,
            gap: 16,
          }}
        >
          {showOtto ? (
            <AIInsightsCard
              isLoading={insightLoading}
              eyebrow={`Cierre de ${stats.label}`}
              description={insight?.description ?? ""}
            />
          ) : null}

          {!stats.hasData ? (
            <View className="bg-surface rounded-2xl p-4 border border-border flex-row items-center gap-3">
              <CalendarOff size={18} color={tokens.textTertiary} />
              <Text className="text-sm text-textSecondary flex-1 leading-5">
                No hubo movimientos en {stats.label}.
              </Text>
            </View>
          ) : null}

          <PeriodSummaryCard
            label={stats.label}
            summary={stats.summary}
            previous={stats.previous}
            projection={stats.projection}
          />

          <TrendChart data={stats.trend} label={trendLabel} />

          {stats.hasData ? (
            <CategoryBreakdownCard
              expenseCategories={stats.expenseCategories}
              incomeCategories={stats.incomeCategories}
              expenseTotal={stats.summary.expense}
              incomeTotal={stats.summary.income}
            />
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
