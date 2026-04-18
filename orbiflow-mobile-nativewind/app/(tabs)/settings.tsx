import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/src/ui/components/atoms";
import { useAuthStore } from "@/src/core/store";
import AuthService from "@/src/core/services/auth.service";

export default function AjustesScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await AuthService.logout();
    useAuthStore.getState().logout();
    queryClient.clear();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-inverse">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-base-color">Ajustes</Text>
      </View>

      <View className="flex-1 px-4 gap-6 pt-4">
        {/* Info del usuario */}
        {user && (
          <View className="bg-white rounded-xl p-4 gap-1">
            <Text className="text-lg font-semibold text-base-color">
              {user.name} {user.lastname}
            </Text>
            <Text className="text-sm text-subordinary">{user.email}</Text>
          </View>
        )}

        {/* Logout */}
        <View className="mt-auto" style={{ paddingBottom: tabBarHeight + 16 }}>
          <Button variant="outline" size="lg" onPress={handleLogout}>
            Cerrar sesión
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
