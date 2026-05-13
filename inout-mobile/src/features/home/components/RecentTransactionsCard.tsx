import { Text, TouchableOpacity, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { Card } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { TransactionItem } from "@/features/transactions";
import type { TransactionListItem } from "@/features/transactions";

interface RecentTransactionsCardProps {
  transactions: TransactionListItem[];
  onSeeAll: () => void;
}

export function RecentTransactionsCard({
  transactions,
  onSeeAll,
}: RecentTransactionsCardProps) {
  const tokens = useThemeTokens();
  if (transactions.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-textPrimary">
          Movimientos recientes
        </Text>
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm font-medium text-brand">Ver todos</Text>
          <ArrowRight size={14} color={tokens.brand} />
        </TouchableOpacity>
      </View>
      <Card padded={false} className="overflow-hidden">
        {transactions.map((tx, idx) => {
          const isLast = idx === transactions.length - 1;
          return (
            <View
              key={tx.id}
              className={!isLast ? "border-b border-border" : ""}
            >
              <TransactionItem
                categoryName={tx.category?.name ?? "Sin categoria"}
                categoryIcon={tx.category?.icon ?? "tag"}
                categoryColor={tx.category?.color ?? "#a6a6a6"}
                description={tx.description}
                amount={tx.amount}
                type={tx.type}
              />
            </View>
          );
        })}
      </Card>
    </View>
  );
}
