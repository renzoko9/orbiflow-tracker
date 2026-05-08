import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/core/store";

export default function AuthLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isHydrated) return null;

  if (isAuthenticated) return <Redirect href="/(tabs)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
