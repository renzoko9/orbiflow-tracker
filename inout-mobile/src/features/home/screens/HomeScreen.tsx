import { useMemo, useRef } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Alert, Loading, type BottomSheetModal } from "@/shared/ui";
import { useAuthStore } from "@/shared/auth";
import { getCurrentMonthRange, getPreviousMonthRange } from "@/shared/utils";
import { useAccounts } from "@/features/accounts";
import { useTransactions } from "@/features/transactions";
import { useInsightStats } from "@/features/insights";
import { AccountMenuSheet } from "@/features/profile";
import {
  BalanceOverviewCard,
  HomeEmptyState,
  HomeHeader,
  OttoChatBar,
  RecentTransactionsCard,
  SpendingPaceCard,
  TopCategoriesCard,
} from "../components";
import { aggregateMonth, topExpenseCategories } from "../model";

export function HomeScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const user = useAuthStore((s) => s.user);
  const accountSheet = useRef<BottomSheetModal>(null);

  const now = useMemo(() => new Date(), []);
  const currentMonthRange = useMemo(() => getCurrentMonthRange(), []);
  const previousMonthRange = useMemo(() => getPreviousMonthRange(), []);

  const { data: accounts = [] } = useAccounts();
  const { data: stats } = useInsightStats({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useTransactions({
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

  const isEmpty = transactions.length === 0;
  const showTopCategories =
    topCategories.length > 0 && currentSummary.expenses > 0;
  const pace =
    stats?.isCurrentPeriod &&
    stats.hasData &&
    stats.projection &&
    stats.daysElapsed != null &&
    stats.daysInMonth != null
      ? {
          spent: stats.summary.expense,
          projected: stats.projection.expense,
          daysElapsed: stats.daysElapsed,
          daysInMonth: stats.daysInMonth,
        }
      : null;

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
          avatarUrl={user?.avatarUrl}
          onAvatarPress={() => accountSheet.current?.present()}
        />

        {isLoading ? (
          <Loading />
        ) : error ? (
          <View className="px-5">
            <Alert variant="error" message={error.message} />
          </View>
        ) : isEmpty ? (
          <HomeEmptyState
            onChatPress={() => router.push("/chat")}
            onManualPress={() => router.push("/transactions/create")}
          />
        ) : (
          <>
            <View className="mx-5 mb-8">
              <BalanceOverviewCard
                totalBalance={totalBalance}
                income={currentSummary.income}
                expenses={currentSummary.expenses}
                previousNet={previousSummary.net}
              />

              {pace ? (
                <SpendingPaceCard
                  {...pace}
                  onPress={() => router.push("/(tabs)/insights")}
                />
              ) : null}
            </View>

            {showTopCategories ? (
              <TopCategoriesCard
                categories={topCategories}
                totalExpenses={currentSummary.expenses}
              />
            ) : null}

            <RecentTransactionsCard
              transactions={recentTransactions}
              onSeeAll={() => router.push("/transactions")}
            />

            <OttoChatBar onPress={() => router.push("/chat")} />
          </>
        )}
      </ScrollView>

      <AccountMenuSheet
        ref={accountSheet}
        onEditProfile={() => router.push("/profile/edit")}
        onSettings={() => router.push("/settings")}
      />
    </SafeAreaView>
  );
}
