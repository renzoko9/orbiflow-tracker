import { forwardRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Camera, Image as ImageIcon } from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetModal,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";

interface AttachMenuProps {
  onCamera: () => void;
  onGallery: () => void;
}

function SheetContent({ onCamera, onGallery }: AttachMenuProps) {
  const tokens = useThemeTokens();
  const { dismiss } = useBottomSheetModal();

  const handle = (action: () => void) => {
    dismiss();
    action();
  };

  return (
    <BottomSheetView>
      <Option
        icon={<Camera size={22} color={tokens.brand} strokeWidth={2.2} />}
        label="Tomar foto"
        onPress={() => handle(onCamera)}
      />
      <Option
        icon={<ImageIcon size={22} color={tokens.brand} strokeWidth={2.2} />}
        label="Elegir de galeria"
        onPress={() => handle(onGallery)}
      />
      <View className="h-6" />
    </BottomSheetView>
  );
}

export const AttachMenu = forwardRef<BottomSheetModal, AttachMenuProps>(
  function AttachMenu(props, ref) {
    return (
      <BottomSheet ref={ref} snapPoints={["25%"]}>
        <SheetContent {...props} />
      </BottomSheet>
    );
  },
);

function Option({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-4 px-5 py-4 border-b border-border"
    >
      <View
        className="items-center justify-center rounded-full bg-brandSoft"
        style={{ width: 40, height: 40 }}
      >
        {icon}
      </View>
      <Text className="text-base font-sans-medium text-textPrimary">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
