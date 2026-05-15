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

const tabular = { fontVariant: ["tabular-nums" as const] };

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
  const sign = isExpense ? "−" : "+";
  const amountClass = isExpense ? "text-danger" : "text-success";
  const hasDescription = description?.trim().length > 0;
  const label = hasDescription ? description : categoryName;

  return (
    <View className="flex-row items-center py-3.5 px-4 bg-background">
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
        style={{ backgroundColor: categoryColor + "1F" }}
      >
        <Icon size={20} color={categoryColor} />
      </View>

      <View className="flex-1 mr-3">
        <Text
          className="text-[15px] font-sans-medium text-textPrimary"
          numberOfLines={1}
        >
          {label}
        </Text>
        {hasDescription && (
          <Text
            className="text-[10px] uppercase text-textTertiary mt-1"
            style={{ letterSpacing: 0.6 }}
            numberOfLines={1}
          >
            {categoryName}
          </Text>
        )}
      </View>

      <Text
        className={`text-[17px] font-display-bold ${amountClass}`}
        style={tabular}
      >
        {sign} {formatCurrency(amount)}
      </Text>
    </View>
  );
}
