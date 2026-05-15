import { SectionList, Text, View } from "react-native";
import { SwipeableTransactionItem } from "./SwipeableTransactionItem";
import { TransactionSectionHeader } from "./TransactionSectionHeader";
import { groupTransactionsByDate, type TransactionListItem } from "../model";

interface TransactionListProps {
  transactions: TransactionListItem[];
  bottomInset?: number;
}

export function TransactionList({
  transactions,
  bottomInset = 0,
}: TransactionListProps) {
  const sections = groupTransactionsByDate(transactions);

  if (sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8 py-16">
        <Text
          className="text-[10px] font-sans-bold uppercase text-textTertiary mb-3"
          style={{ letterSpacing: 1.2 }}
        >
          Sin actividad
        </Text>
        <Text className="text-base text-textSecondary text-center">
          Todavia no registraste movimientos en este periodo.
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
      renderItem={({ item }) => <SwipeableTransactionItem transaction={item} />}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      contentContainerStyle={{ paddingBottom: bottomInset }}
    />
  );
}
