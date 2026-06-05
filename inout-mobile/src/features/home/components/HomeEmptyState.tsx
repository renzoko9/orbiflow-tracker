import { Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { Button } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";

interface HomeEmptyStateProps {
  onChatPress: () => void;
  onManualPress: () => void;
}

/**
 * Bienvenida para el usuario sin movimientos. Empuja las dos formas de
 * registrar: hablar con Otto (destacado) o el alta manual.
 */
export function HomeEmptyState({
  onChatPress,
  onManualPress,
}: HomeEmptyStateProps) {
  const tokens = useThemeTokens();

  return (
    <View className="px-6 pt-8 items-center">
      <View className="w-20 h-20 rounded-full bg-brandSoft items-center justify-center mb-6">
        <Sparkles size={36} color={tokens.brand} />
      </View>

      <Text className="text-2xl font-sans-extrabold text-textPrimary text-center">
        Empieza a registrar tus movimientos
      </Text>
      <Text className="text-base text-textSecondary mt-2 text-center leading-6">
        Cuéntale a Otto tus gastos e ingresos en lenguaje natural, o
        agrégalos manualmente. Tus estadísticas apareceran aquí.
      </Text>

      <View className="w-full mt-8 gap-3">
        <Button size="lg" fullWidth onPress={onChatPress}>
          Registrar con Otto
        </Button>
        <Button variant="outline" size="lg" fullWidth onPress={onManualPress}>
          Agregar manual
        </Button>
      </View>
    </View>
  );
}
