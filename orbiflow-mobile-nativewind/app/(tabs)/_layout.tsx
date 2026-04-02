import { View } from "react-native";
import { Tabs } from "expo-router";
import { Home, ArrowLeftRight, Wallet, Settings } from "lucide-react-native";
import { FloatingAddButton } from "@/src/ui/components/molecules";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#77a8a8",
        tabBarInactiveTintColor: "#a6a6a6",
        tabBarStyle: {
          backgroundColor: "#f1f6f6",
          borderRadius: 24,
          height: 80,
          // paddingBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="movimientos"
        options={{
          title: "Movimientos",
          tabBarIcon: ({ color, size }) => (
            <ArrowLeftRight size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nuevo"
        options={{
          title: "",
          tabBarIcon: () => null,
          tabBarStyle: { display: "none" },
          tabBarButton: () => (
            <View className="flex-1 items-center justify-center">
              <FloatingAddButton />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cuentas"
        options={{
          title: "Cuentas",
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
