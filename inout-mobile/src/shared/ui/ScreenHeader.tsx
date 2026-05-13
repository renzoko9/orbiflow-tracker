import { type ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

interface ScreenHeaderProps {
  title: string;
  rightAction?: ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, rightAction, onBack }: ScreenHeaderProps) {
  const router = useRouter();
  const tokens = useThemeTokens();

  return (
    <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
      <TouchableOpacity
        onPress={onBack ?? (() => router.back())}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <ArrowLeft size={24} color={tokens.textPrimary} />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-textPrimary flex-1 text-center">
        {title}
      </Text>
      <View className="w-6 items-end">{rightAction}</View>
    </View>
  );
}
