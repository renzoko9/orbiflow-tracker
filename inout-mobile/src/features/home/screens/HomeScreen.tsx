import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Alert, Loading } from "@/shared/ui";
import { useAuthStore } from "@/shared/auth";
import { getCurrentMonthRange, getPreviousMonthRange } from "@/shared/utils";
import { useAccounts } from "@/features/accounts";
import { useTransactions } from "@/features/transactions";
import { AIInsightsCard, useMonthlyInsight } from "@/features/insights";
import {
  BalanceOverviewCard,
  HomeHeader,
  RecentTransactionsCard,
  TopCategoriesCard,
} from "../components";
import { aggregateMonth, topExpenseCategories } from "../model";

function Hairline() {
  return <View className="h-px bg-border mx-5 mb-8" />;
}

export function HomeScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const user = useAuthStore((s) => s.user);

  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const previousMonthRange = useMemo(() => getPreviousMonthRange(), []);

  const { data: accounts = [] } = useAccounts();

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useTransactions({
    dateFrom: previousMonthRange.dateFrom,
    dateTo: currentMonthRange.dateTo,
  });

  const { data: insight, isLoading: insightLoading } = useMonthlyInsight();

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

  const showInsight = insightLoading || insight?.available;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 32 }}
      >
        <HomeHeader
          userName={user?.name ?? "Usuario"}
          monthlyNet={currentSummary.net}
        />

        {isLoading ? (
          <Loading />
        ) : error ? (
          <View className="px-5">
            <Alert variant="error" message={error.message} />
          </View>
        ) : (
          <>
            <BalanceOverviewCard
              totalBalance={totalBalance}
              income={currentSummary.income}
              expenses={currentSummary.expenses}
              previousNet={previousSummary.net}
            />

            <TopCategoriesCard
              categories={topCategories}
              totalExpenses={currentSummary.expenses}
            />

            {showInsight && (
              <>
                <Hairline />
                <View className="px-5 mb-8">
                  <AIInsightsCard
                    isLoading={insightLoading}
                    title={insight?.title ?? ""}
                    description={insight?.description ?? ""}
                  />
                </View>
              </>
            )}

            <RecentTransactionsCard
              transactions={recentTransactions}
              onSeeAll={() => router.push("/transactions")}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
