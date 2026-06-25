import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Redirect, Tabs, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  Home,
  Plus,
} from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { useAuthHydrated, useAuthStore } from "@/shared/auth";

const TAB_BAR_HEIGHT = 80;

function TabBarBlurBackground() {
  const tokens = useThemeTokens();
  return (
    <BlurView
      tint="light"
      intensity={Platform.OS === "ios" ? 50 : 70}
      style={[
        StyleSheet.absoluteFillObject,
        {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
          backgroundColor: tokens.background + "E6",
          borderTopWidth: 1,
          borderColor: tokens.border,
        },
      ]}
    />
  );
}

function CenterFabButton({ onPress }: { onPress: () => void }) {
  const tokens = useThemeTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Crear movimiento"
      className="flex-1 items-center justify-center mt-4"
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        className="items-center justify-center rounded-2xl bg-brand"
        style={{ width: 48, height: 48 }}
      >
        <Plus size={26} color={tokens.onBrand} strokeWidth={2.6} />
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const isHydrated = useAuthHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isHydrated) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.brand,
        tabBarInactiveTintColor: tokens.textTertiary,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => <TabBarBlurBackground />,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: TAB_BAR_HEIGHT,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarIconStyle: { marginTop: 6 },
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
          title: "Flujo",
          tabBarIcon: ({ color, size }) => (
            <ArrowLeftRight size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          title: "",
          tabBarButton: () => (
            <CenterFabButton
              onPress={() => router.push("/transactions/create")}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/transactions/create");
          },
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Bot size={size} color={color} onPress={() => router.push("/chat")} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/chat");
          },
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
