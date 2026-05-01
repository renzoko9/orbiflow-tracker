import { useMemo } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { colors } from "@/src/ui/theme/colors";
import { Alert } from "@/src/ui/components/atoms";
import { AIInsightsCard } from "@/src/ui/components/molecules";
import {
  HomeHeader,
  MonthlySummaryCard,
  TopCategoriesCard,
  RecentTransactionsCard,
  getCurrentMonthRange,
  getPreviousMonthRange,
  getCurrentMonthName,
  aggregateMonth,
  topExpenseCategories,
} from "@/src/ui/features/home";
import { useAccounts, useTransactions } from "@/src/ui/hooks";
import { useAuthStore } from "@/src/core/store/auth.store";

export default function InicioScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const user = useAuthStore((s) => s.user);

  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const previousMonthRange = useMemo(() => getPreviousMonthRange(), []);
  const monthName = useMemo(() => getCurrentMonthName(), []);

  const { data: accounts = [] } = useAccounts();

  const { data: transactions = [], isLoading, error } = useTransactions({
    dateFrom: previousMonthRange.dateFrom,
    dateTo: currentMonthRange.dateTo,
  });

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
    [accounts],
  );

  const currentMonthTxs = useMemo(
    () => transactions.filter((tx) => tx.date >= currentMonthRange.dateFrom),
    [transactions, currentMonthRange.dateFrom],
  );

  const previousMonthTxs = useMemo(
    () => transactions.filter((tx) => tx.date < currentMonthRange.dateFrom),
    [transactions, currentMonthRange.dateFrom],
  );

  const currentSummary = useMemo(
    () => aggregateMonth(currentMonthTxs),
    [currentMonthTxs],
  );
  const previousSummary = useMemo(
    () => aggregateMonth(previousMonthTxs),
    [previousMonthTxs],
  );
  const topCategories = useMemo(
    () => topExpenseCategories(currentMonthTxs),
    [currentMonthTxs],
  );
  const recentTransactions = useMemo(
    () => transactions.slice(0, 3),
    [transactions],
  );

  const userName = user?.name ?? "Usuario";

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-inverse">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
      >
        <HomeHeader userName={userName} totalBalance={totalBalance} />

        {isLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator color={colors.primary[5]} />
          </View>
        ) : error ? (
          <View className="px-4">
            <Alert variant="error" message={error.message} />
          </View>
        ) : (
          <View className="px-4">
            <MonthlySummaryCard
              monthName={monthName}
              income={currentSummary.income}
              expenses={currentSummary.expenses}
              previousNet={previousSummary.net}
            />

            <TopCategoriesCard
              categories={topCategories}
              totalExpenses={currentSummary.expenses}
            />

            <AIInsightsCard
              title="Análisis inteligente"
              description="Próximamente: recomendaciones personalizadas según tus hábitos de gasto e ingreso."
            />

            <RecentTransactionsCard
              transactions={recentTransactions}
              onSeeAll={() => router.push("/transactions")}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
