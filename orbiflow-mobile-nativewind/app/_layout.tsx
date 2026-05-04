import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toast } from "@/src/ui/components/atoms";
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

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transactions/create" />
            <Stack.Screen name="transactions/[id]" />
            <Stack.Screen name="accounts/create" />
            <Stack.Screen name="accounts/[id]" />
            <Stack.Screen name="accounts/edit/[id]" />
            <Stack.Screen name="categories/create" />
            <Stack.Screen name="categories/[id]" />
            <Stack.Screen name="categories/edit/[id]" />
          </Stack>
          <StatusBar style="dark" />
          <Toast topOffset={insets.top + 8} />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
