import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Archive } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Alert as AlertBox } from "@/src/ui/components/atoms";
import { ScreenHeader } from "@/src/ui/components/molecules";
import { CategoryListItem } from "@/src/ui/features/categories";
import { useArchivedCategories } from "@/src/ui/hooks";
import { CategoryType } from "@/src/core/enums/category-type.enum";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export default function ArchivedCategoriesScreen() {
  const router = useRouter();
  const { data: categories = [], isLoading, error } = useArchivedCategories();

  const { expenses, incomes } = useMemo(() => {
    const expenses = categories.filter((c) => c.type === CategoryType.EXPENSE);
    const incomes = categories.filter((c) => c.type === CategoryType.INCOME);
    return { expenses, incomes };
  }, [categories]);

  const goToDetail = (id: number) =>
    router.push({
      pathname: "/categories/[id]",
      params: { id: String(id) },
    });

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Categorías archivadas" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      ) : error ? (
        <View className="px-4 mt-4">
          <AlertBox variant="error" message={error.message} />
        </View>
      ) : categories.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Archive size={40} color={colors.subordinary} />
          <Text className="text-base text-text-light font-medium mt-3 text-center">
            No tienes categorías archivadas
          </Text>
          <Text className="text-sm text-subordinary mt-1 text-center">
            Las categorías que elimines aparecerán aquí y podrás restaurarlas
            cuando quieras.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          <Text className="text-sm text-subordinary mb-3">
            Los movimientos históricos de estas categorías se conservan. Tócalas
            para ver el detalle o restaurarlas.
          </Text>

          {expenses.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-text-light mb-2">
                Gastos
              </Text>
              <View
                className="rounded-2xl bg-background-light overflow-hidden"
                style={cardShadow}
              >
                {expenses.map((c, idx) => {
                  const isLast = idx === expenses.length - 1;
                  return (
                    <View
                      key={c.id}
                      className={!isLast ? "border-b border-primary-1" : ""}
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
              </View>
            </View>
          )}

          {incomes.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-text-light mb-2">
                Ingresos
              </Text>
              <View
                className="rounded-2xl bg-background-light overflow-hidden"
                style={cardShadow}
              >
                {incomes.map((c, idx) => {
                  const isLast = idx === incomes.length - 1;
                  return (
                    <View
                      key={c.id}
                      className={!isLast ? "border-b border-primary-1" : ""}
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
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
