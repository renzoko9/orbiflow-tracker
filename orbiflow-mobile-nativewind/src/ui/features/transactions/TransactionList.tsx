import { SectionList, View, Text } from "react-native";
import { SwipeableTransactionItem } from "./SwipeableTransactionItem";
import { TransactionSectionHeader } from "./TransactionSectionHeader";
import { groupTransactionsByDate } from "./group-transactions";
import { TransactionListResponse } from "@/src/core/dto/transaction.interface";

interface TransactionListProps {
  transactions: TransactionListResponse[];
  bottomInset?: number;
}

export function TransactionList({ transactions, bottomInset = 0 }: TransactionListProps) {
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
        <SwipeableTransactionItem transaction={item} />
      )}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      contentContainerStyle={{ paddingBottom: bottomInset }}
    />
  );
}
