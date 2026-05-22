import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BarChart3, Sparkles } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { AIInsightsCard } from "../components";
import { useMonthlyInsight } from "../api";

export function InsightsScreen() {
  const tokens = useThemeTokens();
  const tabBarHeight = useBottomTabBarHeight();
  const { data: insight, isLoading } = useMonthlyInsight();

  const showInsight = isLoading || insight?.available;

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
            isLoading={isLoading}
            title={insight?.title ?? ""}
            description={insight?.description ?? ""}
          />
        ) : (
          <View className="bg-surface rounded-2xl p-5 border border-border">
            <View className="flex-row items-center gap-2 mb-2">
              <Sparkles size={14} color={tokens.textTertiary} />
              <Text
                className="text-[10px] font-sans-bold text-textTertiary uppercase"
                style={{ letterSpacing: 1.5 }}
              >
                Insight mensual
              </Text>
            </View>
            <Text className="text-base font-sans-semibold text-textPrimary mb-1">
              Aun no hay insights
            </Text>
            <Text className="text-sm text-textSecondary leading-5">
              Registra mas movimientos este mes para generar tu primer analisis.
            </Text>
          </View>
        )}

        <View className="bg-surface rounded-2xl p-5 border border-border">
          <View className="flex-row items-center gap-3 mb-3">
            <View
              className="items-center justify-center rounded-xl"
              style={{
                width: 36,
                height: 36,
                backgroundColor: tokens.surfaceMuted,
              }}
            >
              <BarChart3 size={18} color={tokens.brand} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-sans-semibold text-textPrimary">
                Mas metricas pronto
              </Text>
            </View>
            <Text className="text-[10px] font-sans-bold text-textTertiary uppercase">
              Proximamente
            </Text>
          </View>
          <Text className="text-sm text-textSecondary leading-5">
            Vamos a sumar comparativas por categoria, evolucion del balance y
            tendencias mes a mes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
