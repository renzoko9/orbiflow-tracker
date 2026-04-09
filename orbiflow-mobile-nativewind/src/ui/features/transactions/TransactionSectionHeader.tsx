import { Text } from "react-native";

interface TransactionSectionHeaderProps {
  title: string;
}

export function TransactionSectionHeader({
  title,
}: TransactionSectionHeaderProps) {
  return (
    <Text className="text-sm font-semibold text-subordinary uppercase px-4 pt-4 pb-2 bg-inverse">
      {title}
    </Text>
  );
}
