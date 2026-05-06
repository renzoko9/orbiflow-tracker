import { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Camera as CameraIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScreenHeader, FormField } from "@/src/ui/components/molecules";
import {
  Button,
  showToast,
  type BottomSheetModal,
} from "@/src/ui/components/atoms";
import { AvatarActionSheet } from "@/src/ui/features/profile";
import { useAuthStore } from "@/src/core/store";
import {
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
} from "@/src/ui/hooks";
import { ApiError } from "@/src/core/api/api-error";
import { resolveAvatarUrl } from "@/src/core/utils/media.util";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/src/core/schemas/user/update-profile.schema";
import { colors } from "@/src/ui/theme/colors";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const sheetRef = useRef<BottomSheetModal>(null);

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      lastname: user?.lastname ?? "",
    },
  });

  const avatarUri = resolveAvatarUrl(user?.avatarUrl);
  const isAvatarBusy = uploadAvatar.isPending || deleteAvatar.isPending;

  const openSheet = () => sheetRef.current?.present();
  const closeSheet = () => sheetRef.current?.dismiss();

  function showError(err: unknown) {
    const message =
      err instanceof ApiError ? err.message : "Ocurrió un error inesperado";
    showToast({ type: "error", text1: "Error", text2: message });
  }

  function submitAvatar(asset: ImagePicker.ImagePickerAsset) {
    const name = asset.fileName ?? `avatar-${Date.now()}.jpg`;
    const type = asset.mimeType ?? "image/jpeg";
    uploadAvatar.mutate(
      { uri: asset.uri, name, type },
      {
        onSuccess: () =>
          showToast({ type: "success", text1: "Foto actualizada" }),
        onError: showError,
      },
    );
  }

  async function handleTakePhoto() {
    closeSheet();
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      showToast({
        type: "error",
        text1: "Permiso denegado",
        text2: "Habilita el acceso a la cámara",
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    submitAvatar(result.assets[0]);
  }

  async function handlePickGallery() {
    closeSheet();
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showToast({
        type: "error",
        text1: "Permiso denegado",
        text2: "Habilita el acceso a la galería",
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    submitAvatar(result.assets[0]);
  }

  function handleRemoveAvatar() {
    closeSheet();
    Alert.alert("Eliminar foto", "¿Quieres eliminar tu foto de perfil?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          deleteAvatar.mutate(undefined, {
            onSuccess: () =>
              showToast({ type: "success", text1: "Foto eliminada" }),
            onError: showError,
          });
        },
      },
    ]);
  }

  function onSubmit(data: UpdateProfileFormValues) {
    updateProfile.mutate(data, {
      onSuccess: () => {
        showToast({ type: "success", text1: "Perfil actualizado" });
        router.back();
      },
      onError: showError,
    });
  }

  const initials = (
    (user?.name?.[0] ?? "?") + (user?.lastname?.[0] ?? "")
  ).toUpperCase();

  return (
    <SafeAreaView
      className="flex-1 bg-inverse"
      edges={["top", "left", "right"]}
    >
      <ScreenHeader title="Editar perfil" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center gap-3">
            <TouchableOpacity
              onPress={openSheet}
              disabled={isAvatarBusy}
              activeOpacity={0.85}
            >
              <View className="relative">
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 112, height: 112, borderRadius: 56 }}
                    contentFit="cover"
                    transition={150}
                  />
                ) : (
                  <View
                    className="items-center justify-center rounded-full bg-primary-5"
                    style={{ width: 112, height: 112 }}
                  >
                    <Text className="text-3xl font-bold text-white">
                      {initials}
                    </Text>
                  </View>
                )}
                <View className="absolute bottom-0 right-0 bg-primary-6 rounded-full p-2 border-2 border-background-light">
                  <CameraIcon size={16} color={colors.background.light} />
                </View>
                {isAvatarBusy && (
                  <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-full">
                    <ActivityIndicator color={colors.background.light} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openSheet}
              disabled={isAvatarBusy}
              hitSlop={8}
            >
              <Text className="text-sm font-semibold text-primary-6">
                Cambiar foto
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-2">
            <Text className="text-base text-text-light">Nombre *</Text>
            <FormField
              control={control}
              name="name"
              placeholder="Tu nombre"
              autoCapitalize="words"
            />
          </View>

          <View className="gap-2">
            <Text className="text-base text-text-light">Apellido *</Text>
            <FormField
              control={control}
              name="lastname"
              placeholder="Tu apellido"
              autoCapitalize="words"
            />
          </View>

          <View className="gap-2">
            <Text className="text-base text-text-light">
              Correo electrónico
            </Text>
            <View className="rounded-xl bg-primary-1 px-4 py-3">
              <Text className="text-base text-subordinary">
                {user?.email ?? ""}
              </Text>
            </View>
            <Text className="text-xs text-subordinary">
              El correo no se puede modificar
            </Text>
          </View>
        </ScrollView>

        <View className="p-4">
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            loading={updateProfile.isPending}
            disabled={!isDirty}
          >
            Guardar cambios
          </Button>
        </View>
      </KeyboardAvoidingView>

      <AvatarActionSheet
        ref={sheetRef}
        hasAvatar={!!avatarUri}
        onTakePhoto={handleTakePhoto}
        onPickFromGallery={handlePickGallery}
        onRemove={handleRemoveAvatar}
      />
    </SafeAreaView>
  );
}
