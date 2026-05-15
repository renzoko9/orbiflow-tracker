import { Text, TouchableOpacity, View } from "react-native";
import { SectionEyebrow } from "@/shared/ui";
import { formatCurrency, formatRelativeDay } from "@/shared/i18n";
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
  if (transactions.length === 0) return null;

  const seeAll = (
    <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
      <Text className="text-[11px] font-sans-bold text-brandStrong uppercase">
        Ver todos
      </Text>
      <View className="h-px bg-brandStrong mt-0.5" />
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
                className="w-11 h-11 rounded-xl items-center justify-center mr-3.5"
                style={{ backgroundColor: categoryColor + "1F" }}
              >
                <Icon size={20} color={categoryColor} />
              </View>

              <View className="flex-1 mr-3">
                <Text
                  className="text-[14px] font-sans-medium text-textPrimary"
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <Text
                  className="text-[10px] uppercase text-textTertiary mt-1"
                  style={{ letterSpacing: 0.6 }}
                  numberOfLines={1}
                >
                  {categoryName} · {formatRelativeDay(tx.date)}
                </Text>
              </View>

              <Text
                className={`text-[17px] font-display-bold ${amountClass}`}
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
