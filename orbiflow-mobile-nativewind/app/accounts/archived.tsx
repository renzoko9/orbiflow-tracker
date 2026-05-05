import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Archive } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Alert as AlertBox } from "@/src/ui/components/atoms";
import { ScreenHeader } from "@/src/ui/components/molecules";
import { AccountCard } from "@/src/ui/features/accounts";
import { useArchivedAccounts } from "@/src/ui/hooks";

export default function ArchivedAccountsScreen() {
  const router = useRouter();
  const { data: accounts = [], isLoading, error } = useArchivedAccounts();

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Cuentas archivadas" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      ) : error ? (
        <View className="px-4 mt-4">
          <AlertBox variant="error" message={error.message} />
        </View>
      ) : accounts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Archive size={40} color={colors.subordinary} />
          <Text className="text-base text-text-light font-medium mt-3 text-center">
            No tienes cuentas archivadas
          </Text>
          <Text className="text-sm text-subordinary mt-1 text-center">
            Las cuentas que elimines aparecerán aquí y podrás restaurarlas
            cuando quieras.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
        >
          <Text className="text-sm text-subordinary mb-2">
            El historial de movimientos de estas cuentas se conserva. Tócalas
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
