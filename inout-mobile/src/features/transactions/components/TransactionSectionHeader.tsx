import { Text, View } from "react-native";

interface TransactionSectionHeaderProps {
  title: string;
}

/**
 * Header sticky del SectionList. Estilo eyebrow editorial con hairline
 * para anclar el cambio de fecha sin pesar visualmente.
 */
export function TransactionSectionHeader({
  title,
}: TransactionSectionHeaderProps) {
  return (
    <View className="bg-background pt-6 pb-3 px-4">
      <Text
        className="text-[10px] font-sans-bold uppercase text-textTertiary"
        style={{ letterSpacing: 0.5 }}
      >
        {title}
      </Text>
      <View className="h-px bg-border mt-2" />
    </View>
  );
}
