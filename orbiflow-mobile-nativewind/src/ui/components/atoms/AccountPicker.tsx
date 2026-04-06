import { useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { ChevronDown, Wallet } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Account } from "@/src/core/dto/account.interface";

interface AccountPickerProps {
  accounts: Account[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  error?: string;
}

export function AccountPicker({
  accounts,
  selectedId,
  onSelect,
  error,
}: AccountPickerProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const selectedAccount = accounts.find((a) => a.id === selectedId) ?? null;

  const handleOpen = () => bottomSheetRef.current?.present();
  const handleClose = () => bottomSheetRef.current?.dismiss();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <View className="w-full">
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.7}
        className={`flex-row items-center border rounded-lg px-3 py-3 bg-background-light ${
          error ? "border-error-medium" : "border-primary-2"
        }`}
      >
        <Wallet
          size={20}
          color={error ? colors.error.medium : colors.subordinary}
        />
        <Text
          className={`flex-1 ml-2 text-base ${
            selectedAccount
              ? "text-text-light"
              : error
                ? "text-error-medium"
                : "text-subordinary"
          }`}
        >
          {selectedAccount ? selectedAccount.name : "Selecciona una cuenta"}
        </Text>
        {selectedAccount && (
          <Text className="text-sm text-subordinary mr-2">
            S/ {Number(selectedAccount.balance).toFixed(2)}
          </Text>
        )}
        <ChevronDown
          size={18}
          color={error ? colors.error.medium : colors.subordinary}
        />
      </TouchableOpacity>

      {error && <Text className="text-sm text-error-medium mt-1">{error}</Text>}

      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: colors.disabled }}
        backgroundStyle={{ backgroundColor: colors.background.light }}
      >
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
                onPress={() => {
                  onSelect(item.id);
                  handleClose();
                }}
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
      </BottomSheetModal>
    </View>
  );
}
