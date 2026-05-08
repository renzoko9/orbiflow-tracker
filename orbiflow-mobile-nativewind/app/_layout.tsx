import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toast } from "@/src/ui/components/atoms";
import StorageService from "@/src/core/storage/storage.service";
import { STORAGE_KEYS } from "@/src/core/config/environment.config";
import { UserResponse } from "@/src/core/dto/auth.interface";
import { useAuthStore } from "@/src/core/store";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    async function hydrate() {
      const token = await StorageService.getItem(STORAGE_KEYS.accessToken);
      if (token) {
        const userData = await StorageService.getObject<UserResponse>(
          STORAGE_KEYS.userData,
        );
        if (userData) {
          useAuthStore.getState().setUser(userData);
        }
      }
      useAuthStore.getState().setHydrated();
    }
    hydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transactions/create" />
            <Stack.Screen name="transactions/[id]" />
            <Stack.Screen name="accounts/create" />
            <Stack.Screen name="accounts/[id]" />
            <Stack.Screen name="accounts/edit/[id]" />
            <Stack.Screen name="accounts/archived" />
            <Stack.Screen name="categories/create" />
            <Stack.Screen name="categories/[id]" />
            <Stack.Screen name="categories/edit/[id]" />
            <Stack.Screen name="categories/archived" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/change-password" />
          </Stack>
          <StatusBar style="dark" />
          <Toast topOffset={insets.top + 8} />
          {!isHydrated && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#77a8a8" />
            </View>
          )}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#f1f6f6",
    alignItems: "center",
    justifyContent: "center",
  },
});
