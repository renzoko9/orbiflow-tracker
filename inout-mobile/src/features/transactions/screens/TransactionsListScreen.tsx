import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Alert, Input, Loading } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { useCategories } from "@/features/categories";
import {
  TransactionFilters,
  TransactionList,
  type TypeFilter,
} from "../components";
import { useTransactions } from "../api";
import type { FilterTransactionsParams } from "../model";

function getDateRange(range: string): {
  dateFrom?: string;
  dateTo?: string;
} {
  if (range === "all") return {};

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  switch (range) {
    case "today":
      return { dateFrom: todayStr, dateTo: todayStr };
    case "week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return {
        dateFrom: startOfWeek.toISOString().split("T")[0],
        dateTo: todayStr,
      };
    }
    case "month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        dateFrom: startOfMonth.toISOString().split("T")[0],
        dateTo: todayStr,
      };
    }
    default:
      return {};
  }
}

export function TransactionsListScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const tokens = useThemeTokens();
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [dateRange, setDateRange] = useState("all");

  const filters = useMemo<FilterTransactionsParams>(() => {
    const { dateFrom, dateTo } = getDateRange(dateRange);
    return {
      type: typeFilter === "ALL" ? undefined : typeFilter,
      categoryId: selectedCategoryId ?? undefined,
      dateFrom,
      dateTo,
      search: searchText || undefined,
    };
  }, [typeFilter, selectedCategoryId, dateRange, searchText]);

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useTransactions(filters);

  const { data: categories = [] } = useCategories({
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-textPrimary">Movimientos</Text>
      </View>

      <View className="px-4 pb-2 gap-3">
        <Input
          placeholder="Buscar por descripcion o categoria..."
          value={searchText}
          onChangeText={setSearchText}
          leftIcon={<Search size={18} color={tokens.textTertiary} />}
        />
        <TransactionFilters
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={setSelectedCategoryId}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </View>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <View className="px-4">
          <Alert variant="error" message={error.message} />
        </View>
      ) : (
        <TransactionList
          transactions={transactions}
          bottomInset={tabBarHeight + 16}
        />
      )}
    </SafeAreaView>
  );
}
