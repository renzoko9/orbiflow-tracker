import { Alert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQueryClient } from "@tanstack/react-query";
import Constants from "expo-constants";
import {
  Bell,
  DollarSign,
  Download,
  FileText,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Moon,
  Tag,
  Upload,
  User,
  Wallet,
} from "lucide-react-native";
import {
  SettingsItem,
  SettingsSection,
  showToast,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { useAuthStore } from "@/shared/auth";
import { useLogout } from "@/features/auth";
import { ProfileHeader } from "../components";

const ICON_SIZE = 18;
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export function SettingsScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const fullName = user ? `${user.name} ${user.lastname}`.trim() : "Usuario";
  const email = user?.email ?? "";
  const avatarUrl = user?.avatarUrl ?? null;

  const goToEditProfile = () => router.push("/profile/edit");

  const comingSoon = () =>
    showToast({
      type: "info",
      text1: "Proximamente",
      text2: "Esta funcion estara disponible pronto",
    });

  const confirmLogout = () => {
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
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-textPrimary">Ajustes</Text>
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
            icon={<User size={ICON_SIZE} color={tokens.brand} />}
            title="Editar perfil"
            subtitle="Nombre, apellido y foto"
            onPress={goToEditProfile}
          />
          <SettingsItem
            icon={<Lock size={ICON_SIZE} color={tokens.brand} />}
            title="Cambiar contrasena"
            badge="Proximamente"
            onPress={comingSoon}
          />
        </SettingsSection>

        <SettingsSection title="Organizacion">
          <SettingsItem
            icon={<Tag size={ICON_SIZE} color={tokens.brand} />}
            title="Categorias"
            subtitle="Gestiona tus categorias de gasto e ingreso"
            onPress={() => router.push("/categories")}
          />
          <SettingsItem
            icon={<Wallet size={ICON_SIZE} color={tokens.brand} />}
            title="Mis cuentas"
            subtitle="Ver y administrar cuentas"
            onPress={() => router.push("/accounts")}
          />
        </SettingsSection>

        <SettingsSection title="Preferencias">
          <SettingsItem
            icon={<DollarSign size={ICON_SIZE} color={tokens.brand} />}
            title="Moneda"
            subtitle="Sol peruano (PEN)"
            badge="Proximamente"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Moon size={ICON_SIZE} color={tokens.brand} />}
            title="Tema"
            subtitle="Claro"
            badge="Proximamente"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Bell size={ICON_SIZE} color={tokens.brand} />}
            title="Notificaciones"
            badge="Proximamente"
            onPress={comingSoon}
          />
        </SettingsSection>

        <SettingsSection title="Datos">
          <SettingsItem
            icon={<Download size={ICON_SIZE} color={tokens.brand} />}
            title="Exportar movimientos"
            subtitle="Descarga en CSV o PDF"
            badge="Proximamente"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Upload size={ICON_SIZE} color={tokens.brand} />}
            title="Importar datos"
            badge="Proximamente"
            onPress={comingSoon}
          />
        </SettingsSection>

        <SettingsSection title="Informacion">
          <SettingsItem
            icon={<FileText size={ICON_SIZE} color={tokens.brand} />}
            title="Terminos y privacidad"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<HelpCircle size={ICON_SIZE} color={tokens.brand} />}
            title="Ayuda y soporte"
            onPress={comingSoon}
          />
          <SettingsItem
            icon={<Info size={ICON_SIZE} color={tokens.brand} />}
            title="Version"
            rightElement={
              <Text className="text-sm text-textSecondary">{APP_VERSION}</Text>
            }
          />
        </SettingsSection>

        <SettingsSection>
          <SettingsItem
            icon={<LogOut size={ICON_SIZE} color={tokens.danger} />}
            iconBackground={tokens.dangerSoft}
            title="Cerrar sesion"
            danger
            onPress={confirmLogout}
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
