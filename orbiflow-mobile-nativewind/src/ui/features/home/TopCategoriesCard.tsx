import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { List, PieChart } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { getIconComponent } from "@/src/ui/utils/icon-map";
import { CategoryAggregate } from "./aggregate-transactions";
import { CategoryDonutChart } from "./CategoryDonutChart";

interface TopCategoriesCardProps {
  categories: CategoryAggregate[];
  totalExpenses: number;
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

type ViewMode = "list" | "chart";

export function TopCategoriesCard({
  categories,
  totalExpenses,
}: TopCategoriesCardProps) {
  const [mode, setMode] = useState<ViewMode>("chart");

  if (categories.length === 0 || totalExpenses === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-text-light">
          ¿En qué gastaste más?
        </Text>
        <View className="flex-row items-center gap-1 bg-primary-1 rounded-lg p-0.5">
          <TouchableOpacity
            onPress={() => setMode("list")}
            hitSlop={6}
            className={`px-2 py-1 rounded-md ${
              mode === "list" ? "bg-background-light" : ""
            }`}
            activeOpacity={0.7}
          >
            <List
              size={16}
              color={mode === "list" ? colors.primary[6] : colors.subordinary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode("chart")}
            hitSlop={6}
            className={`px-2 py-1 rounded-md ${
              mode === "chart" ? "bg-background-light" : ""
            }`}
            activeOpacity={0.7}
          >
            <PieChart
              size={16}
              color={mode === "chart" ? colors.primary[6] : colors.subordinary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View
        className="rounded-2xl bg-background-light overflow-hidden"
        style={cardShadow}
      >
        {mode === "list" ? (
          categories.map((cat, idx) => {
            const Icon = getIconComponent(cat.icon);
            const percentage = (cat.amount / totalExpenses) * 100;
            const isLast = idx === categories.length - 1;

            return (
              <View
                key={cat.id}
                className={`flex-row items-center px-4 py-3 ${
                  !isLast ? "border-b border-primary-1" : ""
                }`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: cat.color + "25" }}
                >
                  <Icon size={20} color={cat.color} />
                </View>
                <View className="flex-1 mr-3">
                  <Text
                    className="text-base font-medium text-text-light mb-2"
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                  <View className="h-1.5 rounded-full bg-primary-1 overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </View>
                </View>
                <Text className="text-base font-semibold text-text-light">
                  S/ {cat.amount.toFixed(2)}
                </Text>
              </View>
            );
          })
        ) : (
          <View className="px-4 py-4">
            <CategoryDonutChart
              categories={categories}
              totalExpenses={totalExpenses}
            />
          </View>
        )}
      </View>
    </View>
  );
}
