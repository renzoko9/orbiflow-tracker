import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Archive, ChevronRight, Plus } from "lucide-react-native";
import {
  Alert,
  Card,
  Loading,
  ScreenHeader,
  SegmentedControl,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { CategoryListItem } from "../components";
import { useArchivedCategories, useCategories } from "../api";
import { TransactionType } from "../model";

type TypeTab = "EXPENSE" | "INCOME";

export function CategoriesListScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const [activeTab, setActiveTab] = useState<TypeTab>("EXPENSE");

  const selectedType =
    activeTab === "INCOME" ? TransactionType.INCOME : TransactionType.EXPENSE;

  const {
    data: categories = [],
    isLoading,
    error,
  } = useCategories({ type: selectedType });
  const { data: archived = [] } = useArchivedCategories();

  const { mine, globals } = useMemo(() => {
    const mine = categories.filter((c) => c.userId !== null);
    const globals = categories.filter((c) => c.userId === null);
    return { mine, globals };
  }, [categories]);

  const goToDetail = (id: number) =>
    router.push({
      pathname: "/categories/[id]",
      params: { id: String(id) },
    });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        title="Categorias"
        rightAction={
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/categories/create",
                params: { type: String(selectedType) },
              })
            }
            hitSlop={8}
          >
            <Plus size={22} color={tokens.brand} />
          </TouchableOpacity>
        }
      />

      <View className="px-4 pt-2 pb-4">
        <SegmentedControl<TypeTab>
          options={[
            { value: "EXPENSE", label: "Gastos" },
            { value: "INCOME", label: "Ingresos" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </View>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <View className="px-4">
          <Alert variant="error" message={error.message} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          {mine.length === 0 && globals.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-textSecondary text-base">
                No hay categorias{" "}
                {activeTab === "INCOME" ? "de ingresos" : "de gastos"}
              </Text>
            </View>
          ) : (
            <>
              {mine.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-semibold text-textPrimary mb-2">
                    Mis categorias
                  </Text>
                  <Card padded={false} className="overflow-hidden">
                    {mine.map((c, idx) => {
                      const isLast = idx === mine.length - 1;
                      return (
                        <View
                          key={c.id}
                          className={!isLast ? "border-b border-border" : ""}
                        >
                          <CategoryListItem
                            name={c.name}
                            icon={c.icon}
                            color={c.color}
                            isGlobal={false}
                            onPress={() => goToDetail(c.id)}
                          />
                        </View>
                      );
                    })}
                  </Card>
                </View>
              )}

              {globals.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-semibold text-textPrimary mb-2">
                    Predeterminadas
                  </Text>
                  <Card padded={false} className="overflow-hidden">
                    {globals.map((c, idx) => {
                      const isLast = idx === globals.length - 1;
                      return (
                        <View
                          key={c.id}
                          className={!isLast ? "border-b border-border" : ""}
                        >
                          <CategoryListItem
                            name={c.name}
                            icon={c.icon}
                            color={c.color}
                            isGlobal={true}
                            onPress={() => goToDetail(c.id)}
                          />
                        </View>
                      );
                    })}
                  </Card>
                </View>
              )}
            </>
          )}

          {archived.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/categories/archived")}
              activeOpacity={0.7}
              className="mt-2"
            >
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Archive size={18} color={tokens.textSecondary} />
                    <Text className="text-sm font-medium text-textPrimary">
                      Categorias archivadas ({archived.length})
                    </Text>
                  </View>
                  <ChevronRight size={16} color={tokens.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
