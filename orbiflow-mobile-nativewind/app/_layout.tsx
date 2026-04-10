import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "@/src/ui/components/atoms";
import "../global.css";

export default function RootLayout() {
  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="transactions/all" />
          <Stack.Screen name="accounts/create" />
        </Stack>
        <StatusBar style="dark" />
        <Toast topOffset={insets.top + 8} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
