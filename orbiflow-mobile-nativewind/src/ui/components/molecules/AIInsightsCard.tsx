import { View, Text, ActivityIndicator } from "react-native";
import { Sparkles } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

interface AIInsightsCardProps {
  title: string;
  description: string;
  isLoading?: boolean;
}

export function AIInsightsCard({
  title,
  description,
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
        <Text className="text-white/80 text-sm leading-5">{description}</Text>
      )}
    </View>
  );
}
