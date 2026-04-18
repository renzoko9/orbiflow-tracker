import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { colors } from "@/src/ui/theme/colors";
import { Alert } from "@/src/ui/components/atoms";
import { TransactionList } from "@/src/ui/features/transactions";
import { useTransactions } from "@/src/ui/hooks";

const PREVIEW_LIMIT = 10;

export default function MovimientosScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const { data: transactions = [], isLoading, error } = useTransactions({
    limit: PREVIEW_LIMIT,
  });

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-inverse">
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-base-color">Movimientos</Text>
        <TouchableOpacity
          onPress={() => router.push("/transactions/all")}
          hitSlop={8}
        >
          <Text className="text-sm font-medium text-primary-6">Ver más</Text>
        </TouchableOpacity>
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
        <TransactionList transactions={transactions} bottomInset={tabBarHeight + 16} />
      )}
    </SafeAreaView>
  );
}
