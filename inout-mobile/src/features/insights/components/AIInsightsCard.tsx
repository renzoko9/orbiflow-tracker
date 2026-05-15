import { ActivityIndicator, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { Wordmark } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";

interface AIInsightsCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
}

/**
 * Insight con pleca lateral mango sobre fondo suave del mismo tono.
 * Cierra con el wordmark IN·OUT como signature de marca, dandole el peso
 * editorial de un articulo firmado por la app.
 */
export function AIInsightsCard({
  title,
  description,
  isLoading = false,
}: AIInsightsCardProps) {
  const tokens = useThemeTokens();

  return (
    <View className="bg-accentSoft rounded-xl px-5 py-6 border-l-[3px] border-accent">
      <View className="flex-row items-center gap-2 mb-3">
        <Sparkles size={14} color={tokens.accentStrong} />
        <Text
          className="text-[10px] font-sans-bold text-accentStrong uppercase"
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
          <Text className="text-base font-sans-bold text-onAccent mb-1.5">
            {title}
          </Text>
          <Text className="text-sm text-onAccent/80 leading-5">
            {description}
          </Text>

          <View className="flex-row justify-end items-center mt-5 pt-3 border-t border-accent/25">
            <Text
              className="text-[10px] uppercase text-onAccent/50 mr-2"
              style={{ letterSpacing: 1 }}
            >
              by
            </Text>
            <Wordmark className="text-[11px] text-accentStrong" />
          </View>
        </>
      )}
    </View>
  );
}
