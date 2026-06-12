import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import {
  ScreenHeader,
  SettingsSection,
  SettingsItem,
  showToast,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { CURRENCIES, getCurrency } from "@/shared/i18n";
import { useAuthStore } from "@/shared/auth";
import { useUpdateMe } from "../api";

export function CurrencyScreen() {
  const tokens = useThemeTokens();
  const currentCode = useAuthStore((s) => s.user?.currency);
  const active = getCurrency(currentCode);
  const update = useUpdateMe();

  function handleSelect(code: string) {
    if (code === active.code || update.isPending) return;
    // updateMe actualiza el auth store; AppProviders remonta el arbol y todo
    // el dinero se reformatea con el nuevo simbolo.
    update.mutate(
      { currency: code },
      {
        onError: () =>
          showToast({
            type: "error",
            text1: "No se pudo cambiar la moneda",
            text2: "Intenta de nuevo",
          }),
      },
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Moneda" />

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
        <SettingsSection title="Selecciona tu moneda">
          {CURRENCIES.map((currency, index) => {
            const selected = currency.code === active.code;
            return (
              <SettingsItem
                key={currency.code}
                icon={
                  <Text className="text-base font-sans-bold text-brand">
                    {currency.symbol}
                  </Text>
                }
                title={currency.name}
                subtitle={currency.code}
                showBorder={index < CURRENCIES.length - 1}
                onPress={() => handleSelect(currency.code)}
                rightElement={
                  selected ? (
                    <Check size={18} color={tokens.brand} />
                  ) : (
                    <></>
                  )
                }
              />
            );
          })}
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
