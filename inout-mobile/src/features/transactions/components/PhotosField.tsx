import { forwardRef, useRef } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon, Plus, X } from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetView,
  showToast,
  type BottomSheetModal,
} from "@/shared/ui";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useThemeTokens } from "@/shared/theme";
import { resolveAvatarUrl } from "@/shared/utils";
import type { LocalPhoto } from "../model";

const MAX_PHOTOS = 5;
const THUMB_SIZE = 72;

interface PhotosFieldProps {
  existingPhotos: string[];
  newPhotos: LocalPhoto[];
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (index: number) => void;
  onAddNew: (photo: LocalPhoto) => void;
  onPressPhoto?: (uri: string) => void;
  disabled?: boolean;
}

export function PhotosField({
  existingPhotos,
  newPhotos,
  onRemoveExisting,
  onRemoveNew,
  onAddNew,
  onPressPhoto,
  disabled,
}: PhotosFieldProps) {
  const tokens = useThemeTokens();
  const sheetRef = useRef<BottomSheetModal>(null);
  const total = existingPhotos.length + newPhotos.length;
  const canAdd = !disabled && total < MAX_PHOTOS;

  const handlePickImage = async (source: "camera" | "gallery") => {
    const perm =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showToast({
        type: "error",
        text1: "Permiso denegado",
        text2:
          source === "camera"
            ? "Habilita el acceso a la camara"
            : "Habilita el acceso a la galeria",
      });
      return;
    }
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    onAddNew({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? `transaction-${Date.now()}.jpg`,
    });
  };

  return (
    <View>
      <View className="flex-row flex-wrap gap-2">
        {existingPhotos.map((url) => {
          const resolved = resolveAvatarUrl(url);
          return (
            <Thumb
              key={`existing-${url}`}
              uri={resolved ?? url}
              onPress={
                onPressPhoto && resolved
                  ? () => onPressPhoto(resolved)
                  : undefined
              }
              onRemove={
                disabled ? undefined : () => onRemoveExisting(url)
              }
              tokens={tokens}
            />
          );
        })}
        {newPhotos.map((photo, idx) => (
          <Thumb
            key={`new-${photo.uri}-${idx}`}
            uri={photo.uri}
            onPress={onPressPhoto ? () => onPressPhoto(photo.uri) : undefined}
            onRemove={disabled ? undefined : () => onRemoveNew(idx)}
            tokens={tokens}
          />
        ))}
        {canAdd && (
          <Pressable
            onPress={() => sheetRef.current?.present()}
            className="items-center justify-center rounded-xl border border-dashed border-borderStrong bg-surfaceMuted"
            style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
            accessibilityRole="button"
            accessibilityLabel="Agregar foto"
          >
            <Plus size={22} color={tokens.brand} strokeWidth={2.4} />
          </Pressable>
        )}
      </View>
      {total === 0 && !canAdd && (
        <Text className="text-xs text-textTertiary mt-2">Sin adjuntos</Text>
      )}
      <Text className="text-xs text-textTertiary mt-2">
        {total}/{MAX_PHOTOS} fotos. JPG, PNG o WEBP hasta 5MB.
      </Text>

      <AttachSheet
        ref={sheetRef}
        onCamera={() => handlePickImage("camera")}
        onGallery={() => handlePickImage("gallery")}
      />
    </View>
  );
}

function Thumb({
  uri,
  onPress,
  onRemove,
  tokens,
}: {
  uri: string;
  onPress?: () => void;
  onRemove?: () => void;
  tokens: ReturnType<typeof useThemeTokens>;
}) {
  return (
    <View style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
      <Pressable onPress={onPress} disabled={!onPress}>
        <Image
          source={{ uri }}
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: 12,
            backgroundColor: tokens.surfaceMuted,
          }}
          contentFit="cover"
        />
      </Pressable>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={8}
          className="absolute -top-1.5 -right-1.5 items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            backgroundColor: "rgba(0,0,0,0.75)",
          }}
          accessibilityRole="button"
          accessibilityLabel="Quitar foto"
        >
          <X size={14} color="white" strokeWidth={2.6} />
        </TouchableOpacity>
      )}
    </View>
  );
}

interface AttachSheetProps {
  onCamera: () => void;
  onGallery: () => void;
}

function AttachSheetContent({ onCamera, onGallery }: AttachSheetProps) {
  const tokens = useThemeTokens();
  const { dismiss } = useBottomSheetModal();
  const handle = (action: () => void) => {
    dismiss();
    action();
  };
  return (
    <BottomSheetView>
      <AttachOption
        icon={<Camera size={22} color={tokens.brand} strokeWidth={2.2} />}
        label="Tomar foto"
        onPress={() => handle(onCamera)}
      />
      <AttachOption
        icon={<ImageIcon size={22} color={tokens.brand} strokeWidth={2.2} />}
        label="Elegir de galeria"
        onPress={() => handle(onGallery)}
      />
      <View className="h-6" />
    </BottomSheetView>
  );
}

const AttachSheet = forwardRef<BottomSheetModal, AttachSheetProps>(
  function AttachSheet(props, ref) {
    return (
      <BottomSheet ref={ref} snapPoints={["25%"]}>
        <AttachSheetContent {...props} />
      </BottomSheet>
    );
  },
);

function AttachOption({
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
