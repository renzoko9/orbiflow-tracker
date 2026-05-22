import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Archive } from "lucide-react-native";
import { Alert, Card, Loading, ScreenHeader } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { CategoryListItem } from "../components";
import { useArchivedCategories } from "../api";
import { TransactionType } from "../model";

export function ArchivedCategoriesScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { data: categories = [], isLoading, error } = useArchivedCategories();

  const { expenses, incomes } = useMemo(() => {
    const expenses = categories.filter((c) => c.type === TransactionType.EXPENSE);
    const incomes = categories.filter((c) => c.type === TransactionType.INCOME);
    return { expenses, incomes };
  }, [categories]);

  const goToDetail = (id: number) =>
    router.push({
      pathname: "/categories/[id]",
      params: { id: String(id) },
    });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Categorias archivadas" />

      {isLoading ? (
        <Loading />
      ) : error ? (
        <View className="px-4 mt-4">
          <Alert variant="error" message={error.message} />
        </View>
      ) : categories.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Archive size={40} color={tokens.textSecondary} />
          <Text className="text-base text-textPrimary font-medium mt-3 text-center">
            No tienes categorias archivadas
          </Text>
          <Text className="text-sm text-textSecondary mt-1 text-center">
            Las categorias que elimines apareceran aqui y podras restaurarlas
            cuando quieras.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <Text className="text-sm text-textSecondary mb-3">
            Los movimientos historicos de estas categorias se conservan.
            Tocalas para ver el detalle o restaurarlas.
          </Text>

          {expenses.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-textPrimary mb-2">
                Gastos
              </Text>
              <Card padded={false} className="overflow-hidden">
                {expenses.map((c, idx) => {
                  const isLast = idx === expenses.length - 1;
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

          {incomes.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-textPrimary mb-2">
                Ingresos
              </Text>
              <Card padded={false} className="overflow-hidden">
                {incomes.map((c, idx) => {
                  const isLast = idx === incomes.length - 1;
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
