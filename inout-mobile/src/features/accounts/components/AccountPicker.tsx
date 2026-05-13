import { Pressable, Text, View } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { formatCurrency } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";
import type { Account } from "../model";

interface AccountPickerProps {
  accounts: Account[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function AccountPicker({
  accounts,
  selectedId,
  onSelect,
}: AccountPickerProps) {
  return (
    <BottomSheetFlatList
      data={accounts}
      keyExtractor={(item: Account) => String(item.id)}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      ListHeaderComponent={
        <Text className="text-lg font-semibold text-textPrimary py-3">
          Seleccionar cuenta
        </Text>
      }
      renderItem={({ item }: { item: Account }) => {
        const isSelected = item.id === selectedId;
        const Icon = getIconComponent(item.icon);

        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            className={`flex-row items-center px-4 py-4 rounded-xl mb-2 border ${
              isSelected
                ? "bg-brandSoft border-brand"
                : "bg-surface border-border"
            }`}
          >
            <View
              className="w-11 h-11 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: item.color + "25" }}
            >
              <Icon size={22} color={item.color} />
            </View>

            <Text
              className={`flex-1 mr-3 text-base font-medium ${
                isSelected ? "text-brand" : "text-textPrimary"
              }`}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              className={`text-sm font-semibold ${
                isSelected ? "text-brand" : "text-textSecondary"
              }`}
            >
              {formatCurrency(item.balance)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
