import { ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";

interface ScreenHeaderProps {
  title: string;
  rightAction?: ReactNode;
}

export function ScreenHeader({ title, rightAction }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
      <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
        <ArrowLeft size={24} color={colors.base} />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-base-color flex-1 text-center">
        {title}
      </Text>
      <View className="w-6 items-end">{rightAction}</View>
    </View>
  );
}
