import { forwardRef, type ReactNode } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { LogOut, Settings as SettingsIcon, User } from "lucide-react-native";
import {
  BottomSheet,
  BottomSheetView,
  type BottomSheetModal,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { useAuthStore } from "@/shared/auth";
import { useLogout } from "@/features/auth";
import { resolveAvatarUrl } from "@/shared/utils";

interface AccountMenuSheetProps {
  onEditProfile: () => void;
  onSettings: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
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
      className="flex-row items-center gap-3 px-5 py-4 border-b border-border"
    >
      {icon}
      <Text
        className={`text-base font-sans-semibold ${
          danger ? "text-danger" : "text-textPrimary"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SheetContent({ onEditProfile, onSettings }: AccountMenuSheetProps) {
  const tokens = useThemeTokens();
  const { dismiss } = useBottomSheetModal();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const fullName = user ? `${user.name} ${user.lastname}`.trim() : "Usuario";
  const email = user?.email ?? "";
  const resolvedUrl = resolveAvatarUrl(user?.avatarUrl);

  const handleEdit = () => {
    dismiss();
    onEditProfile();
  };

  const handleSettings = () => {
    dismiss();
    onSettings();
  };

  const handleLogout = () => {
    dismiss();
    Alert.alert("Cerrar sesion", "Estas seguro de que quieres cerrar sesion?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesion",
        style: "destructive",
        onPress: () => {
          logout.mutate(undefined, {
            onSuccess: () => {
              queryClient.clear();
              router.replace("/(auth)/login");
            },
          });
        },
      },
    ]);
  };

  return (
    <BottomSheetView>
      <View className="flex-row items-center gap-4 px-5 pt-2 pb-5 border-b border-border">
        {resolvedUrl ? (
          <Image
            source={{ uri: resolvedUrl }}
            style={{ width: 56, height: 56, borderRadius: 28 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View
            className="items-center justify-center rounded-full bg-brand"
            style={{ width: 56, height: 56 }}
          >
            <Text className="text-xl font-sans-bold text-onBrand">
              {getInitials(fullName)}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text
            className="text-lg font-sans-semibold text-textPrimary"
            numberOfLines={1}
          >
            {fullName}
          </Text>
          <Text className="text-sm text-textSecondary" numberOfLines={1}>
            {email}
          </Text>
        </View>
      </View>

      <ActionRow
        icon={<User size={20} color={tokens.brand} />}
        label="Perfil"
        onPress={handleEdit}
      />
      <ActionRow
        icon={<SettingsIcon size={20} color={tokens.brand} />}
        label="Ajustes"
        onPress={handleSettings}
      />
      <ActionRow
        icon={<LogOut size={20} color={tokens.danger} />}
        label="Cerrar sesion"
        onPress={handleLogout}
        danger
      />
      <View className="h-6" />
    </BottomSheetView>
  );
}

export const AccountMenuSheet = forwardRef<
  BottomSheetModal,
  AccountMenuSheetProps
>(function AccountMenuSheet(props, ref) {
  return (
    <BottomSheet ref={ref}>
      <SheetContent {...props} />
    </BottomSheet>
  );
});
