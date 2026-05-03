import { ReactNode, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { MoreVertical } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

export interface KebabMenuItem {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  variant?: "default" | "danger";
}

interface KebabMenuProps {
  items: KebabMenuItem[];
}

export function KebabMenu({ items }: KebabMenuProps) {
  const [open, setOpen] = useState(false);

  const handleItemPress = (item: KebabMenuItem) => {
    setOpen(false);
    setTimeout(() => item.onPress(), 0);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} hitSlop={8}>
        <MoreVertical size={22} color={colors.base} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          onPress={() => setOpen(false)}
        >
          <View
            className="absolute right-3 top-14 rounded-xl bg-inverse min-w-[180px] overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            {items.map((item, idx) => {
              const isDanger = item.variant === "danger";
              const isLast = idx === items.length - 1;
              return (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.6}
                  className={`flex-row items-center gap-3 px-4 py-3 ${
                    !isLast ? "border-b border-primary-1" : ""
                  }`}
                >
                  {item.icon}
                  <Text
                    className={`text-base ${
                      isDanger
                        ? "text-error-medium font-medium"
                        : "text-text-light"
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
