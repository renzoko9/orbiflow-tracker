import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  Bell,
  DollarSign,
  Download,
  FileText,
  HelpCircle,
  Info,
  Lock,
  Moon,
  Tag,
  Upload,
  Wallet,
} from "lucide-react-native";
import {
  ScreenHeader,
  SettingsItem,
  SettingsSection,
  showToast,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { getCurrency } from "@/shared/i18n";
import { useAuthStore } from "@/shared/auth";

const ICON_SIZE = 18;
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export function SettingsScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const activeCurrency = getCurrency(useAuthStore((s) => s.user?.currency));

  const comingSoon = () =>
    showToast({
      type: "info",
      text1: "Proximamente",
      text2: "Esta funcion estara disponible pronto",
    });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Ajustes" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 32,
          gap: 24,
        }}
      >
        <SettingsSection title="Seguridad">
          <SettingsItem
            icon={<Lock size={ICON_SIZE} color={tokens.brand} />}
            title="Cambiar contraseña"
            subtitle="Verifica por correo y define una nueva"
            onPress={() => router.push("/change-password")}
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
            subtitle={`${activeCurrency.name} (${activeCurrency.code})`}
            onPress={() => router.push("/currency")}
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
              <Text
                className="text-sm font-display-semibold text-textSecondary"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {APP_VERSION}
              </Text>
            }
          />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
