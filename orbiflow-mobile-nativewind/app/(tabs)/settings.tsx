import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import {
  User,
  Lock,
  Tag,
  Wallet,
  DollarSign,
  Moon,
  Bell,
  Download,
  Upload,
  FileText,
  HelpCircle,
  LogOut,
  Info,
} from "lucide-react-native";
import {
  ProfileHeader,
  SettingsSection,
  SettingsItem,
} from "@/src/ui/components/molecules";
import { showToast } from "@/src/ui/components/atoms";
import { colors } from "@/src/ui/theme/colors";
import { useAuthStore } from "@/src/core/store";
import AuthService from "@/src/core/services/auth.service";

const ICON_SIZE = 18;
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function AjustesScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const fullName = user ? `${user.name} ${user.lastname}`.trim() : "Usuario";
  const email = user?.email ?? "";
  const avatarUrl = user?.avatarUrl ?? null;

  const goToEditProfile = () => router.push("/profile/edit");

  const comingSoon = () =>
    showToast({
      type: "info",
      text1: "Próximamente",
      text2: "Esta función estará disponible pronto",
    });

  const confirmLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await AuthService.logout();
            useAuthStore.getState().logout();
            queryClient.clear();
            router.replace("/(auth)/login");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-primary-1"
    >
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-base-color">Ajustes</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: tabBarHeight + 24,
          gap: 20,
        }}
      >
        <ProfileHeader
          name={fullName}
          email={email}
          avatarUrl={avatarUrl}
          onPress={goToEditProfile}
        />

        <SettingsSection title="Cuenta">
          <SettingsItem
            icon={<User size={ICON_SIZE} color={colors.primary[6]} />}
            title="Editar perfil"
            subtitle="Nombre, apellido y foto"
            onPress={goToEditProfile}
          />
          <SettingsItem
            icon={<Lock size={ICON_SIZE} color={colors.primary[6]} />}
            title="Cambiar contraseña"
            onPress={() => router.push("/profile/change-password")}
          />
        </SettingsSection>

        <SettingsSection title="Organización">
          <SettingsItem
            icon={<Tag size={ICON_SIZE} color={colors.primary[6]} />}
            title="Categorías"
            subtitle="Gestiona tus categorías de gasto e ingreso"
            onPress={() => router.push("/categories" as never)}
          />
          <SettingsItem
            icon={<Wallet size={ICON_SIZE} color={colors.primary[6]} />}
            title="Mis cuentas"
            subtitle="Ver y administrar cuentas"
            onPress={() => router.push("/accounts")}
          />
        </SettingsSection>

        <SettingsSection title="Preferencias">
          <SettingsItem
            icon={<DollarSign size={ICON_SIZE} color={colors.primary[6]} />}
            title="Moneda"
            subtitle="Sol peruano (PEN)"
            badge="Próximamente"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Moon size={ICON_SIZE} color={colors.primary[6]} />}
            title="Tema"
            subtitle="Claro"
            badge="Próximamente"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Bell size={ICON_SIZE} color={colors.primary[6]} />}
            title="Notificaciones"
            badge="Próximamente"
            onPress={comingSoon}
          />
        </SettingsSection>

        <SettingsSection title="Datos">
          <SettingsItem
            icon={<Download size={ICON_SIZE} color={colors.primary[6]} />}
            title="Exportar movimientos"
            subtitle="Descarga en CSV o PDF"
            badge="Próximamente"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Upload size={ICON_SIZE} color={colors.primary[6]} />}
            title="Importar datos"
            badge="Próximamente"
            onPress={comingSoon}
          />
        </SettingsSection>

        <SettingsSection title="Información">
          <SettingsItem
            icon={<FileText size={ICON_SIZE} color={colors.primary[6]} />}
            title="Términos y privacidad"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<HelpCircle size={ICON_SIZE} color={colors.primary[6]} />}
            title="Ayuda y soporte"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Info size={ICON_SIZE} color={colors.primary[6]} />}
            title="Versión"
            rightElement={
              <Text className="text-sm text-subordinary">{APP_VERSION}</Text>
            }
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsItem
            icon={<LogOut size={ICON_SIZE} color={colors.error.medium} />}
            iconBackground={colors.error.soft}
            title="Cerrar sesión"
            danger
            onPress={confirmLogout}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
