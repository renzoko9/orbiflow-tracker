import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Archive, ChevronRight } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Alert as AlertBox, SegmentedControl } from "@/src/ui/components/atoms";
import { ScreenHeader } from "@/src/ui/components/molecules";
import { CategoryListItem } from "@/src/ui/features/categories";
import { useCategories, useArchivedCategories } from "@/src/ui/hooks";
import { CategoryType } from "@/src/core/enums/category-type.enum";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

type TypeTab = "EXPENSE" | "INCOME";

export default function CategoriesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TypeTab>("EXPENSE");

  const selectedType =
    activeTab === "INCOME" ? CategoryType.INCOME : CategoryType.EXPENSE;

  const { data: categories = [], isLoading, error } = useCategories({
    type: selectedType,
  });
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
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader
        title="Categorías"
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
            <Plus size={22} color={colors.primary[6]} />
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
          className="bg-primary-1"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      ) : error ? (
        <View className="px-4">
          <AlertBox variant="error" message={error.message} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          {mine.length === 0 && globals.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-subordinary text-base">
                No hay categorías {activeTab === "INCOME" ? "de ingresos" : "de gastos"}
              </Text>
            </View>
          ) : (
            <>
              {mine.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-semibold text-text-light mb-2">
                    Mis categorías
                  </Text>
                  <View
                    className="rounded-2xl bg-background-light overflow-hidden"
                    style={cardShadow}
                  >
                    {mine.map((c, idx) => {
                      const isLast = idx === mine.length - 1;
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

              {globals.length > 0 && (
                <View className="mb-4">
                  <Text className="text-base font-semibold text-text-light mb-2">
                    Predeterminadas
                  </Text>
                  <View
                    className="rounded-2xl bg-background-light overflow-hidden"
                    style={cardShadow}
                  >
                    {globals.map((c, idx) => {
                      const isLast = idx === globals.length - 1;
                      return (
                        <View
                          key={c.id}
                          className={!isLast ? "border-b border-primary-1" : ""}
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
                  </View>
                </View>
              )}
            </>
          )}

          {archived.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/categories/archived")}
              activeOpacity={0.7}
              className="flex-row items-center justify-between rounded-2xl bg-background-light px-4 py-3 mt-2"
              style={cardShadow}
            >
              <View className="flex-row items-center gap-3">
                <Archive size={18} color={colors.subordinary} />
                <Text className="text-sm font-medium text-text-light">
                  Categorías archivadas ({archived.length})
                </Text>
              </View>
              <ChevronRight size={16} color={colors.subordinary} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
