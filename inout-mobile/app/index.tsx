import { Redirect } from "expo-router";
import { View } from "react-native";
import { useAuthHydrated, useAuthStore } from "@/shared/auth";
import { Loading } from "@/shared/ui";

/**
 * Splash route. Espera a que el auth store rehidrate desde SecureStore
 * y redirige segun la sesion.
 */
export default function Index() {
  const hydrated = useAuthHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!hydrated) {
    return (
      <View className="flex-1 bg-background">
        <Loading />
      </View>
    );
  }

  // TODO: redirigir a /(tabs)/home cuando se incorpore el dashboard.
  return isAuthenticated ? (
    <Redirect href="/(auth)/login" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
