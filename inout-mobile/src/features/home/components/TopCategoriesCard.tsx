import { Text, View } from "react-native";
import { SectionEyebrow } from "@/shared/ui";
import { formatCurrency } from "@/shared/i18n";
import type { CategoryAggregate } from "../model";

interface TopCategoriesCardProps {
  categories: CategoryAggregate[];
  totalExpenses: number;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function TopCategoriesCard({
  categories,
  totalExpenses,
}: TopCategoriesCardProps) {
  if (categories.length === 0 || totalExpenses === 0) return null;

  return (
    <View className="px-5 mb-8">
      <SectionEyebrow label="En que gastaste · Este mes" />

      <View className="gap-4">
        {categories.map((cat) => {
          const percentage = (cat.amount / totalExpenses) * 100;
          return (
            <View key={cat.id}>
              <View className="flex-row items-baseline justify-between mb-1.5">
                <Text
                  className="text-base font-sans-medium text-textPrimary flex-1 mr-3"
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
                <Text
                  className="text-base font-display-bold text-textPrimary"
                  style={tabular}
                >
                  {formatCurrency(cat.amount)}
                </Text>
              </View>
              <View className="h-1.5 rounded-full bg-surfaceMuted overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: cat.color,
                    opacity: 0.5
                  }}
                />
              </View>
              <Text
                className="text-[11px] text-textTertiary mt-1"
                style={tabular}
              >
                {percentage.toFixed(0)}% del total
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
