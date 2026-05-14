import { Text, TouchableOpacity, View } from "react-native";
import { ArrowUpRight } from "lucide-react-native";
import { SectionEyebrow } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";
import { CategoryType } from "@/features/categories";
import type { TransactionListItem } from "@/features/transactions";

interface RecentTransactionsCardProps {
  transactions: TransactionListItem[];
  onSeeAll: () => void;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function RecentTransactionsCard({
  transactions,
  onSeeAll,
}: RecentTransactionsCardProps) {
  const tokens = useThemeTokens();
  if (transactions.length === 0) return null;

  const seeAll = (
    <TouchableOpacity
      onPress={onSeeAll}
      hitSlop={8}
      className="flex-row items-center gap-1"
    >
      <Text className="text-[11px] font-bold text-brand uppercase" style={{ letterSpacing: 1.2 }}>
        Ver todos
      </Text>
      <ArrowUpRight size={12} color={tokens.brand} />
    </TouchableOpacity>
  );

  return (
    <View className="px-5 mb-8">
      <SectionEyebrow label="Movimientos recientes" rightElement={seeAll} />

      <View className="gap-6">
        {transactions.map((tx) => {
          const categoryName = tx.category?.name ?? "Sin categoria";
          const categoryIcon = tx.category?.icon ?? "tag";
          const categoryColor = tx.category?.color ?? "#a6a6a6";
          const Icon = getIconComponent(categoryIcon);
          const isExpense = tx.type === CategoryType.EXPENSE;
          const sign = isExpense ? "−" : "+";
          const amountClass = isExpense ? "text-danger" : "text-success";
          const label = tx.description?.trim() ? tx.description : categoryName;

          return (
            <View key={tx.id} className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: categoryColor + "20" }}
              >
                <Icon size={18} color={categoryColor} />
              </View>

              <View className="flex-1 mr-3">
                <Text
                  className="text-[15px] font-medium text-textPrimary"
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <Text
                  className="text-xs text-textTertiary mt-0.5"
                  numberOfLines={1}
                >
                  {categoryName}
                </Text>
              </View>

              <Text
                className={`text-[15px] font-bold ${amountClass}`}
                style={tabular}
              >
                {sign} {formatCurrency(tx.amount)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
