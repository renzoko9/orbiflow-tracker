import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Camera,
  Image as ImageIcon,
  Send,
  Sparkles,
  X,
} from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

const SUGGESTIONS = [
  "Gaste 20 soles en taxi",
  "Recibi mi sueldo de 3500",
  "Cuanto gaste en comida este mes?",
];

export function ChatScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();

  const closeChat = () => router.navigate("/home");

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-background"
    >
      <View
        className="flex-row items-center gap-3 px-4 py-3"
        style={{ borderBottomWidth: 1, borderColor: tokens.border }}
      >
        <TouchableOpacity onPress={closeChat} hitSlop={8}>
          <X size={24} color={tokens.textPrimary} />
        </TouchableOpacity>
        <View
          className="items-center justify-center rounded-full bg-brand"
          style={{ width: 40, height: 40 }}
        >
          <Sparkles size={20} color={tokens.onBrand} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-sans-bold text-textPrimary">
            Otto
          </Text>
          <Text className="text-xs text-textTertiary">
            Asistente financiero
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 20,
          gap: 12,
        }}
      >
        <View
          className="self-start rounded-2xl bg-surface px-4 py-3"
          style={{
            borderTopLeftRadius: 4,
            borderWidth: 1,
            borderColor: tokens.border,
            maxWidth: "85%",
          }}
        >
          <Text className="text-base text-textPrimary leading-6">
            Hola, soy Otto. Cuentame que gastaste o ingresaste y lo registro
            por ti.
          </Text>
        </View>

        <View
          className="self-start rounded-2xl bg-surface px-4 py-3"
          style={{
            borderTopLeftRadius: 4,
            borderWidth: 1,
            borderColor: tokens.border,
            maxWidth: "85%",
          }}
        >
          <Text className="text-base text-textPrimary leading-6">
            Tambien puedes mandarme una foto del voucher, producto o servicio
            y yo me encargo del resto.
          </Text>
        </View>

        <View className="self-start flex-row flex-wrap gap-2 mt-2">
          {SUGGESTIONS.map((suggestion) => (
            <Pressable
              key={suggestion}
              className="rounded-full bg-brandSoft px-3 py-2"
            >
              <Text className="text-xs font-sans-semibold text-brand">
                {suggestion}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View
        className="flex-row items-center gap-2 px-3 py-2 bg-background"
        style={{ borderTopWidth: 1, borderColor: tokens.border }}
      >
        <Pressable
          className="items-center justify-center rounded-full"
          style={{ width: 40, height: 40 }}
        >
          <Camera size={22} color={tokens.textSecondary} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          className="items-center justify-center rounded-full"
          style={{ width: 40, height: 40 }}
        >
          <ImageIcon
            size={22}
            color={tokens.textSecondary}
            strokeWidth={2.2}
          />
        </Pressable>
        <View
          className="flex-1 px-4 py-2.5 rounded-full bg-surfaceMuted"
        >
          <Text className="text-sm text-textTertiary">
            Escribe o manda una foto...
          </Text>
        </View>
        <Pressable
          className="items-center justify-center rounded-full bg-brand"
          style={{ width: 40, height: 40 }}
        >
          <Send size={18} color={tokens.onBrand} strokeWidth={2.4} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
