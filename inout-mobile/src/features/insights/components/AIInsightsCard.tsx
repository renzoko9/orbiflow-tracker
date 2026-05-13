import { ActivityIndicator, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";

interface AIInsightsCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
}

/**
 * Card destacada para mostrar un insight generado con IA.
 * Usa `surfaceInverse` para resaltar contra el fondo claro.
 */
export function AIInsightsCard({
  title,
  description,
  isLoading = false,
}: AIInsightsCardProps) {
  return (
    <View className="rounded-2xl px-4 py-5 mb-4 bg-surfaceInverse">
      <View className="flex-row items-center mb-2">
        <Sparkles size={20} color="#fff" />
        <Text className="text-textInverse font-semibold text-base ml-2">
          {isLoading ? "Generando insight..." : title}
        </Text>
      </View>

      {isLoading ? (
        <View className="py-3">
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <Text className="text-textInverse opacity-80 text-sm leading-5">
          {description}
        </Text>
      )}
    </View>
  );
}
