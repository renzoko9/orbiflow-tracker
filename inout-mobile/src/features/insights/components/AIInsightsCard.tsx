import { ActivityIndicator, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

interface AIInsightsCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
}

/**
 * Insight con pleca lateral mango sobre fondo suave del mismo tono.
 * Crea un acento calido que rompe el ritmo de los bloques fríos.
 */
export function AIInsightsCard({
  title,
  description,
  isLoading = false,
}: AIInsightsCardProps) {
  const tokens = useThemeTokens();

  return (
    <View
      className="bg-accentSoft rounded-xl pl-5 pr-5 py-5 border-l-[3px] border-accent"
    >
      <View className="flex-row items-center gap-2 mb-2">
        <Sparkles size={14} color={tokens.accentStrong} />
        <Text
          className="text-[10px] font-bold text-accentStrong uppercase"
          style={{ letterSpacing: 1.5 }}
        >
          Insight mensual
        </Text>
      </View>

      {isLoading ? (
        <View className="py-2">
          <ActivityIndicator color={tokens.accentStrong} />
        </View>
      ) : (
        <>
          <Text className="text-base font-bold text-onAccent mb-1">
            {title}
          </Text>
          <Text className="text-sm text-onAccent/80 leading-5">
            {description}
          </Text>
        </>
      )}
    </View>
  );
}
