import { View, Text, TouchableOpacity } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { TransactionItem } from "@/src/ui/features/transactions";
import { TransactionListResponse } from "@/src/core/dto/transaction.interface";

interface RecentTransactionsCardProps {
  transactions: TransactionListResponse[];
  onSeeAll: () => void;
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

export function RecentTransactionsCard({
  transactions,
  onSeeAll,
}: RecentTransactionsCardProps) {
  if (transactions.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-text-light">
          Movimientos recientes
        </Text>
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm font-medium text-primary-6">Ver todos</Text>
          <ArrowRight size={14} color={colors.primary[6]} />
        </TouchableOpacity>
      </View>
      <View
        className="rounded-2xl bg-background-light overflow-hidden"
        style={cardShadow}
      >
        {transactions.map((tx, idx) => {
          const isLast = idx === transactions.length - 1;
          return (
            <View
              key={tx.id}
              className={!isLast ? "border-b border-primary-1" : ""}
            >
              <TransactionItem
                categoryName={tx.category?.name ?? "Sin categoría"}
                categoryIcon={tx.category?.icon ?? "tag"}
                categoryColor={tx.category?.color ?? "#a6a6a6"}
                description={tx.description}
                amount={tx.amount}
                type={tx.type}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}
