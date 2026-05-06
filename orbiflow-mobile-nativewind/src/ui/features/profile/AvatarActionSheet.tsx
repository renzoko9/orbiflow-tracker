import { forwardRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Camera, ImageIcon, Trash2 } from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetView,
  BottomSheetModal,
} from "@/src/ui/components/atoms";
import { colors } from "@/src/ui/theme/colors";

interface AvatarActionSheetProps {
  hasAvatar: boolean;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onRemove: () => void;
}

interface ActionRowProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function ActionRow({ icon, label, onPress, danger }: ActionRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 px-4 py-4 border-b border-primary-1"
    >
      {icon}
      <Text
        className={`text-base ${danger ? "text-error-medium" : "text-text-light"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export const AvatarActionSheet = forwardRef<
  BottomSheetModal,
  AvatarActionSheetProps
>(({ hasAvatar, onTakePhoto, onPickFromGallery, onRemove }, ref) => {
  return (
    <BottomSheet ref={ref}>
      <BottomSheetView>
        <View className="px-4 pt-2 pb-1">
          <Text className="text-base font-semibold text-text-light">
            Foto de perfil
          </Text>
        </View>
        <ActionRow
          icon={<Camera size={20} color={colors.primary[6]} />}
          label="Tomar foto"
          onPress={onTakePhoto}
        />
        <ActionRow
          icon={<ImageIcon size={20} color={colors.primary[6]} />}
          label="Elegir de galería"
          onPress={onPickFromGallery}
        />
        {hasAvatar && (
          <ActionRow
            icon={<Trash2 size={20} color={colors.error.medium} />}
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

AvatarActionSheet.displayName = "AvatarActionSheet";
