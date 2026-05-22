import { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { formatHeaderDate } from "@/shared/i18n";
import { resolveAvatarUrl } from "@/shared/utils";

interface HomeHeaderProps {
  userName: string;
  avatarUrl?: string | null;
  onAvatarPress?: () => void;
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function HomeHeader({
  userName,
  avatarUrl,
  onAvatarPress,
}: HomeHeaderProps) {
  const resolvedUrl = resolveAvatarUrl(avatarUrl);
  const today = useMemo(() => formatHeaderDate(new Date()), []);

  return (
    <View className="px-5 pt-6 pb-6 flex-row items-center gap-4">
      <View className="flex-1">
        <Text
          className="text-[11px] font-sans-bold uppercase text-textDisabled mb-1"
          style={{ letterSpacing: 0.4 }}
        >
          {today}
        </Text>
        <Text
          className="text-2xl font-sans-extrabold text-textPrimary"
          numberOfLines={1}
        >
          Hola, {userName}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onAvatarPress}
        activeOpacity={0.7}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu de cuenta"
      >
        {resolvedUrl ? (
          <Image
            source={{ uri: resolvedUrl }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View
            className="items-center justify-center rounded-full bg-brand"
            style={{ width: 44, height: 44 }}
          >
            <Text className="text-base font-sans-bold text-onBrand">
              {getInitial(userName)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
