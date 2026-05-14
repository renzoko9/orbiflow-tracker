import { Text, View } from "react-native";

interface HomeHeaderProps {
  userName: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  return (
    <View className="px-5 pt-6 pb-6">
      <Text className="text-sm text-textTertiary">{getGreeting()},</Text>
      <Text
        className="text-3xl font-extrabold text-textPrimary mt-1"
        style={{ letterSpacing: -0.5 }}
      >
        {userName}
      </Text>
    </View>
  );
}
