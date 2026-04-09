import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
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

export default function AllTransactionsScreen() {
  const router = useRouter();

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

  const { transactions, loading, error } = useTransactions(filters);

  const { categories } = useCategories({
    type: typeFilter === "ALL" ? undefined : typeFilter,
  });

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.base} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-base-color flex-1 text-center">
          Movimientos
        </Text>
        <View className="w-6" />
      </View>

      {/* Search + Filters */}
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

      {/* Transaction List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      ) : error ? (
        <View className="px-4">
          <Alert variant="error" message={error} />
        </View>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </SafeAreaView>
  );
}
