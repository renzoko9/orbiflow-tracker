import { Text, TouchableOpacity, View } from "react-native";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

interface OttoChatBarProps {
  onPress: () => void;
}

/**
 * Invitacion a probar el chat de Otto al final del home. Muestra un ejemplo
 * de lenguaje natural para que se entienda el valor: registrar sin formularios.
 */
export function OttoChatBar({ onPress }: OttoChatBarProps) {
  const tokens = useThemeTokens();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Abrir chat con Otto"
      className="mx-5 flex-row items-center gap-4 rounded-2xl bg-brandSoft p-4"
    >
      <View className="w-11 h-11 rounded-full bg-brand items-center justify-center">
        <Sparkles size={22} color={tokens.onBrand} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-sans-bold text-textPrimary">
          Registrar es solo escribir
        </Text>
        <Text
          className="text-sm text-textSecondary mt-0.5"
          numberOfLines={1}
        >
          Dile a Otto: “gaste S/20 en el almuerzo”
        </Text>
      </View>

      <ArrowRight size={20} color={tokens.brandStrong} />
    </TouchableOpacity>
  );
}
