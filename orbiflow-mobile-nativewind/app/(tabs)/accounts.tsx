import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Plus, Archive, ChevronRight } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Alert } from "@/src/ui/components/atoms";
import { AIInsightsCard } from "@/src/ui/components/molecules";
import {
  AccountCard,
  AccountsHeader,
  AccountsDistributionCard,
} from "@/src/ui/features/accounts";
import { useAccounts, useArchivedAccounts } from "@/src/ui/hooks";

export default function CuentasScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { data: accounts = [], isLoading, error } = useAccounts();
  const { data: archived = [] } = useArchivedAccounts();

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
    [accounts],
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-inverse">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-base-color">Cuentas</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
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

            <AIInsightsCard
              title="Optimiza tus cuentas"
              description="Próximamente: sugerencias para mover y distribuir tu dinero entre cuentas según tus hábitos."
            />

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-text-light">
                Mis cuentas
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/accounts/create")}
                hitSlop={8}
                className="flex-row items-center gap-1"
              >
                <Plus size={16} color={colors.primary[6]} />
                <Text className="text-sm font-medium text-primary-6">
                  Nueva
                </Text>
              </TouchableOpacity>
            </View>

            {accounts.length === 0 ? (
              <View className="items-center py-16">
                <Text className="text-subordinary text-base">
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
                className="flex-row items-center justify-between rounded-2xl bg-background-light px-4 py-3 mt-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <Archive size={18} color={colors.subordinary} />
                  <Text className="text-sm font-medium text-text-light">
                    Cuentas archivadas ({archived.length})
                  </Text>
                </View>
                <ChevronRight size={16} color={colors.subordinary} />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
