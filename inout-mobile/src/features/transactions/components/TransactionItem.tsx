import { Text, View } from "react-native";
import { formatCurrency } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";
import { CategoryType } from "@/features/categories";

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
  const amountClass = isExpense ? "text-danger" : "text-success";

  return (
    <View className="flex-row items-center py-3 px-4 bg-surface">
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: categoryColor + "40" }}
      >
        <Icon size={24} color={categoryColor} />
      </View>

      <View className="flex-1 mr-3">
        <Text
          className="text-base font-medium text-textPrimary"
          numberOfLines={1}
        >
          {description || categoryName}
        </Text>
        {description ? (
          <Text
            className="text-sm text-textSecondary mt-0.5"
            numberOfLines={1}
          >
            {categoryName}
          </Text>
        ) : null}
      </View>

      <Text className={`text-base font-semibold ${amountClass}`}>
        {sign}
        {formatCurrency(amount)}
      </Text>
    </View>
  );
}
