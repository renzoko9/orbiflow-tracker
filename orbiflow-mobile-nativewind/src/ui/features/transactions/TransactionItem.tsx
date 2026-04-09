import { View, Text } from "react-native";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import { getIconComponent } from "@/src/ui/utils/icon-map";

interface TransactionItemProps {
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  description: string;
  amount: number;
  type: CategoryType;
}

export function TransactionItem({
  categoryName,
  categoryIcon,
  categoryColor,
  description,
  amount,
  type,
}: TransactionItemProps) {
  const Icon = getIconComponent(categoryIcon);
  const isExpense = type === CategoryType.EXPENSE;
  const sign = isExpense ? "-" : "+";
  const amountColor = isExpense ? "text-error-medium" : "text-success-medium";

  return (
    <View className="flex-row items-center py-3 px-4">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: categoryColor + "40" }} // Adding transparency to the color
      >
        <Icon size={24} color={categoryColor} />
      </View>

      <View className="flex-1 mr-3">
        <Text
          className="text-base font-medium text-text-light"
          numberOfLines={1}
        >
          {categoryName}
        </Text>
        {description ? (
          <Text className="text-sm text-subordinary mt-0.5" numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>

      <Text className={`text-base font-semibold ${amountColor}`}>
        {sign}S/ {amount.toFixed(2)}
      </Text>
    </View>
  );
}
