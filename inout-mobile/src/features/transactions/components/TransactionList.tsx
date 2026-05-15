import { Pressable, SectionList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { TransactionItem } from "./TransactionItem";
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
  const router = useRouter();
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
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/transactions/[id]",
              params: { id: String(item.id) },
            })
          }
          android_ripple={{ color: "rgba(0,0,0,0.05)" }}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${item.description || item.category?.name || "movimiento"}`}
        >
          <TransactionItem
            categoryName={item.category?.name ?? "Sin categoria"}
            categoryIcon={item.category?.icon ?? "tag"}
            categoryColor={item.category?.color ?? "#a6a6a6"}
            description={item.description}
            amount={item.amount}
            type={item.type}
          />
        </Pressable>
      )}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
      contentContainerStyle={{ paddingBottom: bottomInset }}
    />
  );
}
