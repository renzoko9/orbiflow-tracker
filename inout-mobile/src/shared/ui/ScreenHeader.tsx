import { type ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";

type HeaderAlign = "left" | "center" | "right";

interface ScreenHeaderProps {
  title?: ReactNode;
  titleAlign?: HeaderAlign;
  rightAction?: ReactNode;
  onBack?: () => void;
}

const JUSTIFY: Record<HeaderAlign, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

const TEXT_ALIGN: Record<HeaderAlign, "left" | "center" | "right"> = {
  left: "left",
  center: "center",
  right: "right",
};

export function ScreenHeader({
  title,
  titleAlign = "center",
  rightAction,
  onBack,
}: ScreenHeaderProps) {
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
      <View
        className={`flex-1 flex-row items-center ${JUSTIFY[titleAlign]}`}
      >
        {typeof title === "string" ? (
          <Text
            className="text-xl font-bold text-textPrimary flex-1"
            style={{ textAlign: TEXT_ALIGN[titleAlign] }}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : (
          title
        )}
      </View>
      <View className="w-6 items-end">{rightAction}</View>
    </View>
  );
}
