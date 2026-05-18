import { Pressable, Text, View } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency } from "@/shared/i18n";
import { cn, getIconComponent } from "@/shared/utils";
import type { Account } from "../model";

interface AccountPickerProps {
  accounts: Account[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const tabular = { fontVariant: ["tabular-nums" as const] };

export function AccountPicker({
  accounts,
  selectedId,
  onSelect,
}: AccountPickerProps) {
  const tokens = useThemeTokens();

  return (
    <BottomSheetFlatList
      data={accounts}
      keyExtractor={(item: Account) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 32 }}
      ItemSeparatorComponent={() => <View className="h-px bg-border" />}
      ListHeaderComponent={
        <View className="px-5 pt-2 pb-3">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary"
            style={{ letterSpacing: 0.5 }}
          >
            Seleccionar
          </Text>
          <Text className="text-2xl font-sans-extrabold text-textPrimary mt-1">
            Cuenta
          </Text>
        </View>
      }
      renderItem={({ item }: { item: Account }) => {
        const selected = item.id === selectedId;
        const Icon = getIconComponent(item.icon);
        const description = item.description?.trim();

        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            android_ripple={{ color: tokens.surfaceMuted }}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              "flex-row items-center px-5 py-3",
              selected && "bg-brandSoft",
            )}
          >
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: item.color + "1F" }}
            >
              <Icon size={22} color={item.color} />
            </View>

            <View className="flex-1 mr-3">
              <Text
                className={cn(
                  "text-[15px]",
                  selected
                    ? "font-sans-bold text-brand"
                    : "font-sans-semibold text-textPrimary",
                )}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {description ? (
                <Text
                  className="text-[10px] uppercase text-textTertiary mt-1"
                  style={{ letterSpacing: 0.6 }}
                  numberOfLines={1}
                >
                  {description}
                </Text>
              ) : null}
            </View>

            <Text
              className={cn(
                "text-lg font-display-bold",
                selected ? "text-brand" : "text-textPrimary",
              )}
              style={[{ includeFontPadding: false }, tabular]}
            >
              {formatCurrency(item.balance)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
