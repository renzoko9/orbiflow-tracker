import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRight, Plus, Wallet } from "lucide-react-native";
import {
  Alert,
  Button,
  Loading,
  ScreenHeader,
  SectionEyebrow,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { AccountCard, AccountsDistributionCard } from "../components";
import { useAccounts, useArchivedAccounts } from "../api";

export function AccountsListScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { data: accounts = [], isLoading, error } = useAccounts();
  const { data: archived = [] } = useArchivedAccounts();

  const totalAbs = useMemo(
    () =>
      accounts.reduce((sum, acc) => sum + Math.abs(Number(acc.balance)), 0),
    [accounts],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        title="Mis cuentas"
        rightAction={
          <TouchableOpacity
            onPress={() => router.push("/accounts/create")}
            hitSlop={8}
          >
            <Plus size={22} color={tokens.brand} />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <Loading />
      ) : error ? (
        <View className="px-4 pt-4">
          <Alert variant="error" message={error.message} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View className="px-4 pt-4">
            <AccountsDistributionCard accounts={accounts} />

            <SectionEyebrow label="Mis cuentas" />

            {accounts.length === 0 ? (
              <View className="items-center py-12 px-6">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: tokens.brand + "1F" }}
                >
                  <Wallet size={28} color={tokens.brand} />
                </View>
                <Text
                  className="text-[10px] font-sans-bold uppercase text-textTertiary mb-2"
                  style={{ letterSpacing: 1.2 }}
                >
                  Sin cuentas
                </Text>
                <Text className="text-xl font-sans-extrabold text-textPrimary text-center">
                  Crea tu primera cuenta
                </Text>
                <Text className="text-sm text-textTertiary text-center mt-2 mb-5">
                  Necesitas al menos una cuenta para registrar tus movimientos
                </Text>
                <Button onPress={() => router.push("/accounts/create")}>
                  Crear cuenta
                </Button>
              </View>
            ) : (
              <View className="gap-3">
                {accounts.map((account) => {
                  const abs = Math.abs(Number(account.balance));
                  const share = totalAbs > 0 ? (abs / totalAbs) * 100 : 0;
                  return (
                    <AccountCard
                      key={account.id}
                      name={account.name}
                      balance={account.balance}
                      description={account.description}
                      icon={account.icon}
                      color={account.color}
                      sharePercent={accounts.length > 1 ? share : undefined}
                      onPress={() =>
                        router.push({
                          pathname: "/accounts/[id]",
                          params: { id: String(account.id) },
                        })
                      }
                    />
                  );
                })}
              </View>
            )}

            {archived.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/accounts/archived")}
                hitSlop={8}
                className="flex-row items-center justify-center gap-2 mt-8 py-3"
              >
                <Text
                  className="text-[11px] font-sans-bold uppercase text-textTertiary"
                  style={{ letterSpacing: 0.8 }}
                >
                  Ver cuentas archivadas ({archived.length})
                </Text>
                <ArrowRight size={14} color={tokens.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
