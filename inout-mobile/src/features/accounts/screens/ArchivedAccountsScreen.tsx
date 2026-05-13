import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Archive } from "lucide-react-native";
import { Alert, Loading, ScreenHeader } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { AccountCard } from "../components";
import { useArchivedAccounts } from "../api";

export function ArchivedAccountsScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { data: accounts = [], isLoading, error } = useArchivedAccounts();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Cuentas archivadas" />

      {isLoading ? (
        <Loading />
      ) : error ? (
        <View className="px-4 mt-4">
          <Alert variant="error" message={error.message} />
        </View>
      ) : accounts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Archive size={40} color={tokens.textSecondary} />
          <Text className="text-base text-textPrimary font-medium mt-3 text-center">
            No tienes cuentas archivadas
          </Text>
          <Text className="text-sm text-textSecondary mt-1 text-center">
            Las cuentas que elimines apareceran aqui y podras restaurarlas
            cuando quieras.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
        >
          <Text className="text-sm text-textSecondary mb-2">
            El historial de movimientos de estas cuentas se conserva. Tocalas
            para ver el detalle o restaurarlas.
          </Text>

          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              name={account.name}
              balance={account.balance}
              description={account.description}
              icon={account.icon}
              color={account.color}
              onPress={() =>
                router.push({
                  pathname: "/accounts/[id]",
                  params: { id: String(account.id) },
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
