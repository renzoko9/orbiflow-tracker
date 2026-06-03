import { ActivityIndicator, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { Wordmark } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";

interface AIInsightsCardProps {
  description: string;
  isLoading?: boolean;
  eyebrow?: string;
}

/**
 * Nota de cierre escrita por la IA. Caja surface como el resto del dashboard,
 * con una pleca mango y el eyebrow en acento para distinguirla como nota de
 * Otto. Firma discreta By Otto · IN·OUT al pie.
 */
export function AIInsightsCard({
  description,
  isLoading = false,
  eyebrow = "Insight mensual",
}: AIInsightsCardProps) {
  const tokens = useThemeTokens();

  return (
    <View className="bg-surface rounded-2xl p-5 border border-accentSoft">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[11px] font-sans-bold uppercase text-accentStrong">
          {eyebrow}
        </Text>
        <Sparkles size={14} color={tokens.accentStrong} />
      </View>

      {isLoading ? (
        <View className="py-2">
          <ActivityIndicator color={tokens.accentStrong} />
        </View>
      ) : (
        <>
          <Text className="text-sm text-textSecondary leading-6">
            {description}
          </Text>

          <View className="flex-row justify-end items-center mt-4 pt-3 border-t border-border">
            <Text
              className="text-[10px] font-sans-bold uppercase text-textTertiary mr-1.5"
              style={{ letterSpacing: 1 }}
            >
              By Otto ·
            </Text>
            <Wordmark className="text-[11px] text-textTertiary" />
          </View>
        </>
      )}
    </View>
  );
}
