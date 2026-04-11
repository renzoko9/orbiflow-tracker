import { View, Text, Pressable } from "react-native";
import { BottomSheetFlatList } from "@/src/ui/components/atoms/BottomSheet";
import { Account } from "@/src/core/dto/account.interface";
import { getIconComponent } from "@/src/ui/utils/icon-map";

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
        <Text className="text-lg font-semibold text-text-light py-3">
          Seleccionar cuenta
        </Text>
      }
      renderItem={({ item }: { item: Account }) => {
        const isSelected = item.id === selectedId;
        const Icon = getIconComponent(item.icon);
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            className={`flex-row items-center px-4 py-4 rounded-xl mb-2 ${
              isSelected
                ? "bg-primary-1 border border-primary-5"
                : "bg-background-light border border-primary-2"
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
                isSelected ? "text-primary-7" : "text-text-light"
              }`}
              numberOfLines={1}
            >
              {item.name}
            </Text>

            <Text
              className={`text-sm font-semibold ${
                isSelected ? "text-primary-6" : "text-subordinary"
              }`}
            >
              S/ {Number(item.balance).toFixed(2)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
