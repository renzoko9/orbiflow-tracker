import { useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Archive, ChevronRight, Plus } from "lucide-react-native";
import { Alert, Card, Loading } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import {
  AccountCard,
  AccountsDistributionCard,
  AccountsHeader,
} from "../components";
import { useAccounts, useArchivedAccounts } from "../api";

export function AccountsListScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const tabBarHeight = useBottomTabBarHeight();
  const { data: accounts = [], isLoading, error } = useAccounts();
  const { data: archived = [] } = useArchivedAccounts();

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
    [accounts],
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-textPrimary">Cuentas</Text>
      </View>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <View className="px-4">
          <Alert variant="error" message={error.message} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
        >
          <AccountsHeader
            totalBalance={totalBalance}
            accountCount={accounts.length}
          />

          <View className="px-4">
            <AccountsDistributionCard accounts={accounts} />

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-textPrimary">
                Mis cuentas
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/accounts/create")}
                hitSlop={8}
                className="flex-row items-center gap-1"
              >
                <Plus size={16} color={tokens.brand} />
                <Text className="text-sm font-medium text-brand">Nueva</Text>
              </TouchableOpacity>
            </View>

            {accounts.length === 0 ? (
              <View className="items-center py-16">
                <Text className="text-textSecondary text-base">
                  No tienes cuentas registradas
                </Text>
              </View>
            ) : (
              <View className="gap-3">
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
              </View>
            )}

            {archived.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/accounts/archived")}
                activeOpacity={0.7}
                className="mt-4"
              >
                <Card>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Archive size={18} color={tokens.textSecondary} />
                      <Text className="text-sm font-medium text-textPrimary">
                        Cuentas archivadas ({archived.length})
                      </Text>
                    </View>
                    <ChevronRight size={16} color={tokens.textSecondary} />
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
