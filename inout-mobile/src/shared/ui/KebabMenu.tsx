import { useRef, type ReactNode } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MoreVertical } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { BottomSheet, BottomSheetView, type BottomSheetModal } from "./BottomSheet";

export interface KebabMenuItem {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  variant?: "default" | "danger";
}

interface KebabMenuProps {
  items: KebabMenuItem[];
}

export function KebabMenu({ items }: KebabMenuProps) {
  const tokens = useThemeTokens();
  const sheetRef = useRef<BottomSheetModal>(null);

  return (
    <>
      <TouchableOpacity
        onPress={() => sheetRef.current?.present()}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Mas opciones"
      >
        <MoreVertical size={22} color={tokens.textPrimary} />
      </TouchableOpacity>

      <BottomSheet ref={sheetRef} snapPoints={["30%"]}>
        <BottomSheetView className="px-4 pt-2 pb-8">
          {items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                sheetRef.current?.dismiss();
                requestAnimationFrame(item.onPress);
              }}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 py-4 border-b border-border"
            >
              {item.icon}
              <Text
                className={`text-base ${
                  item.variant === "danger"
                    ? "text-danger"
                    : "text-textPrimary"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
