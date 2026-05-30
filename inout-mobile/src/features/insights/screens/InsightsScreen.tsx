import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Sparkles } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { Loading } from "@/shared/ui";
import {
  AIInsightsCard,
  CategoryBreakdownCard,
  SavingsRateCard,
  StatTile,
  TrendChart,
} from "../components";
import { useInsightStats, useMonthlyInsight } from "../api";

export function InsightsScreen() {
  const tokens = useThemeTokens();
  const tabBarHeight = useBottomTabBarHeight();
  const { data: insight, isLoading: insightLoading } = useMonthlyInsight();
  const { data: stats, isLoading: statsLoading } = useInsightStats();

  const showInsight = insightLoading || insight?.available;
  const daysRemaining = stats
    ? stats.daysInMonth - stats.daysElapsed
    : 0;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <View className="px-5 pt-6 pb-6">
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

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: tabBarHeight + 32,
          gap: 16,
        }}
      >
        {showInsight ? (
          <AIInsightsCard
            isLoading={insightLoading}
            title={insight?.title ?? ""}
            description={insight?.description ?? ""}
          />
        ) : null}

        {statsLoading ? (
          <Loading />
        ) : !stats || !stats.hasData ? (
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={14} color={tokens.textTertiary} />
              <Text
                className="text-[10px] font-sans-bold text-textTertiary uppercase"
                style={{ letterSpacing: 1.5 }}
              >
                Sin datos este mes
              </Text>
            </View>
            <Text className="text-base font-sans-semibold text-textPrimary mb-1">
              Aun no hay movimientos
            </Text>
            <Text className="text-sm text-textSecondary leading-5">
              Registra ingresos y gastos este mes para ver tus estadisticas y
              tendencias.
            </Text>
          </View>
        ) : (
          <>
            <SavingsRateCard
              savingsRate={stats.month.savingsRate}
              net={stats.month.net}
              projectedNet={stats.projection.net}
              daysRemaining={daysRemaining}
            />

            <View className="flex-row gap-3">
              <StatTile
                label="Ingresos"
                amount={stats.month.income}
                valueClassName="text-success"
                deltaPercent={
                  stats.previousMonth
                    ? deltaOf(
                        stats.month.income,
                        stats.previousMonth.income,
                      )
                    : null
                }
                higherIsBetter
              />
              <StatTile
                label="Gastos"
                amount={stats.month.expense}
                valueClassName="text-danger"
                deltaPercent={stats.previousMonth?.expenseDeltaPercent ?? null}
                higherIsBetter={false}
              />
            </View>

            <TrendChart data={stats.trend} />

            {stats.topCategories.length > 0 && (
              <CategoryBreakdownCard
                categories={stats.topCategories}
                totalExpense={stats.month.expense}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function deltaOf(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
