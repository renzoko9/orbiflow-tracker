import { Pressable, View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import {
  Home,
  ArrowLeftRight,
  Wallet,
  Settings,
  Plus,
} from "lucide-react-native";

function FloatingAddButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/nuevo")}
      className="absolute -top-6 items-center justify-center w-14 h-14 bg-primary-5 rounded-full shadow-lg"
      style={{
        shadowColor: "#476464",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      }}
    >
      <Plus size={28} color="#fff" strokeWidth={2.5} />
    </Pressable>
  );
}

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
          // height: 60,
          // paddingBottom: 8,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
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
