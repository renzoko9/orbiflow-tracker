import { View, Text, Pressable } from "react-native";
import { Wallet } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { BottomSheetFlatList } from "@/src/ui/components/atoms/BottomSheet";
import { Account } from "@/src/core/dto/account.interface";

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
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            className={`flex-row items-center justify-between px-4 py-4 rounded-xl mb-2 ${
              isSelected
                ? "bg-primary-1"
                : "bg-background-light border border-primary-2"
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  isSelected ? "bg-primary-5" : "bg-primary-2"
                }`}
              >
                <Wallet
                  size={18}
                  color={isSelected ? colors.inverse : colors.primary[6]}
                />
              </View>
              <Text
                className={`text-base font-medium ${
                  isSelected ? "text-primary-7" : "text-text-light"
                }`}
              >
                {item.name}
              </Text>
            </View>
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
