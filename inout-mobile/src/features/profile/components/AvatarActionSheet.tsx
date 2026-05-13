import { forwardRef, type ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Camera, ImageIcon, Trash2 } from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetModal,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";

interface AvatarActionSheetProps {
  hasAvatar: boolean;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onRemove: () => void;
}

interface ActionRowProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function ActionRow({ icon, label, onPress, danger }: ActionRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-4 py-4 border-b border-border"
    >
      {icon}
      <Text
        className={`text-base ${danger ? "text-danger" : "text-textPrimary"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export const AvatarActionSheet = forwardRef<
  BottomSheetModal,
  AvatarActionSheetProps
>(function AvatarActionSheet(
  { hasAvatar, onTakePhoto, onPickFromGallery, onRemove },
  ref,
) {
  const tokens = useThemeTokens();

  return (
    <BottomSheet ref={ref}>
      <BottomSheetView>
        <View className="px-4 pt-2 pb-1">
          <Text className="text-base font-semibold text-textPrimary">
            Foto de perfil
          </Text>
        </View>
        <ActionRow
          icon={<Camera size={20} color={tokens.brand} />}
          label="Tomar foto"
          onPress={onTakePhoto}
        />
        <ActionRow
          icon={<ImageIcon size={20} color={tokens.brand} />}
          label="Elegir de galeria"
          onPress={onPickFromGallery}
        />
        {hasAvatar && (
          <ActionRow
            icon={<Trash2 size={20} color={tokens.danger} />}
            label="Eliminar foto"
            onPress={onRemove}
            danger
          />
        )}
        <View className="h-6" />
      </BottomSheetView>
    </BottomSheet>
  );
});
