import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { resolveAvatarUrl } from "@/src/core/utils/media.util";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  onPress?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

export function ProfileHeader({
  name,
  email,
  avatarUrl,
  onPress,
}: ProfileHeaderProps) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const resolvedUrl = resolveAvatarUrl(avatarUrl);

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-4 bg-white rounded-2xl p-4"
    >
      {resolvedUrl ? (
        <Image
          source={{ uri: resolvedUrl }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View
          className="items-center justify-center rounded-full bg-primary-5"
          style={{ width: 56, height: 56 }}
        >
          <Text className="text-xl font-bold text-white">
            {getInitials(name)}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text
          className="text-lg font-semibold text-base-color"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="text-sm text-subordinary" numberOfLines={1}>
          {email}
        </Text>
      </View>
      {onPress && <ChevronRight size={20} color={colors.subordinary} />}
    </Wrapper>
  );
}
