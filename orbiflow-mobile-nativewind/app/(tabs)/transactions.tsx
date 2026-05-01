import { useState, useMemo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { colors } from "@/src/ui/theme/colors";
import { Input, Alert } from "@/src/ui/components/atoms";
import {
  TransactionList,
  TransactionFilters,
} from "@/src/ui/features/transactions";
import type { TypeFilter } from "@/src/ui/features/transactions";
import { useTransactions, useCategories } from "@/src/ui/hooks";
import { FilterTransactionsParams } from "@/src/core/dto/transaction.interface";

function getDateRange(range: string): { dateFrom?: string; dateTo?: string } {
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

export default function MovimientosScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
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

  const { data: transactions = [], isLoading, error } = useTransactions(filters);

  const { data: categories = [] } = useCategories({
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-inverse">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-base-color">Movimientos</Text>
      </View>

      <View className="px-4 pb-2 gap-3">
        <Input
          placeholder="Buscar por descripción o categoría..."
          value={searchText}
          onChangeText={setSearchText}
          leftIcon={<Search size={18} color={colors.subordinary} />}
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      ) : error ? (
        <View className="px-4">
          <Alert variant="error" message={error.message} />
        </View>
      ) : (
        <TransactionList transactions={transactions} bottomInset={tabBarHeight + 16} />
      )}
    </SafeAreaView>
  );
}
