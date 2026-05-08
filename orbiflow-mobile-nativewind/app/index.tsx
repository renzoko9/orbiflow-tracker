import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/core/store";

export default function Index() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isHydrated) return null;

  return <Redirect href={isAuthenticated ? "/(tabs)/home" : "/(auth)/login"} />;
}
