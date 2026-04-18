import { Platform, View } from "react-native";
import { Tabs, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, ArrowLeftRight, Wallet, Settings } from "lucide-react-native";
import { FloatingAddButton } from "@/src/ui/components/molecules";

const TAB_BAR_HEIGHT = 80;
const FAB_ALLOWED_TABS = ["home", "transactions"];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const currentTab = segments[segments.length - 1];
  const showFab = FAB_ALLOWED_TABS.includes(currentTab);
  const fabBottom =
    Platform.OS === "ios"
      ? TAB_BAR_HEIGHT + 12
      : insets.bottom + TAB_BAR_HEIGHT + 12;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#77a8a8",
          tabBarInactiveTintColor: "#a6a6a6",
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: "#f1f6f6",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: TAB_BAR_HEIGHT,
            borderTopWidth: 1,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "Movimientos",
            tabBarIcon: ({ color, size }) => (
              <ArrowLeftRight size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: "Cuentas",
            tabBarIcon: ({ color, size }) => (
              <Wallet size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Ajustes",
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {showFab && (
        <View
          pointerEvents="box-none"
          className="absolute left-0 right-0 items-end"
          style={{ bottom: fabBottom, paddingRight: 16 }}
        >
          <FloatingAddButton />
        </View>
      )}
    </View>
  );
}
