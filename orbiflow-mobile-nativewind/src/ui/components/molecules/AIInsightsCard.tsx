import { View, Text, ActivityIndicator } from "react-native";
import { Sparkles } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

interface AIInsightsCardProps {
  title: string;
  description: string;
  bullets?: string[];
  isLoading?: boolean;
}

export function AIInsightsCard({
  title,
  description,
  bullets,
  isLoading = false,
}: AIInsightsCardProps) {
  return (
    <View
      className="rounded-2xl px-4 py-5 mb-4"
      style={{ backgroundColor: colors.primary[8] }}
    >
      <View className="flex-row items-center mb-2">
        <Sparkles size={20} color="#fff" />
        <Text className="text-white font-semibold text-base ml-2">
          {isLoading ? "Generando insight..." : title}
        </Text>
      </View>

      {isLoading ? (
        <View className="py-3">
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <>
          <Text className="text-white/80 text-sm leading-5">{description}</Text>
          {bullets && bullets.length > 0 && (
            <View className="mt-3">
              {bullets.map((bullet, i) => (
                <View key={i} className="flex-row mb-1">
                  <Text className="text-white/80 text-sm mr-2">•</Text>
                  <Text className="text-white/80 text-sm leading-5 flex-1">
                    {bullet}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}
