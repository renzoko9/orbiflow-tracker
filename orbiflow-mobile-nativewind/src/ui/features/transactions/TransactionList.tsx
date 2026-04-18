import { SectionList, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { TransactionItem } from "./TransactionItem";
import { TransactionSectionHeader } from "./TransactionSectionHeader";
import { groupTransactionsByDate } from "./group-transactions";
import { TransactionListResponse } from "@/src/core/dto/transaction.interface";

interface TransactionListProps {
  transactions: TransactionListResponse[];
  bottomInset?: number;
}

export function TransactionList({ transactions, bottomInset = 0 }: TransactionListProps) {
  const router = useRouter();
  const sections = groupTransactionsByDate(transactions);

  if (sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-subordinary text-base">
          No hay movimientos registrados
        </Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderSectionHeader={({ section }) => (
        <TransactionSectionHeader title={section.title} />
      )}
      renderItem={({ item }) => (
        <TransactionItem
          categoryName={item.category?.name ?? "Sin categoría"}
          categoryIcon={item.category?.icon ?? "tag"}
          categoryColor={item.category?.color ?? "#a6a6a6"}
          description={item.description}
          amount={item.amount}
          type={item.type}
          onPress={() =>
            router.push({
              pathname: "/transactions/[id]",
              params: { id: String(item.id) },
            })
          }
        />
      )}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      contentContainerStyle={{ paddingBottom: bottomInset }}
    />
  );
}
