import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import { Button } from "@/shared/ui";
import { messages } from "@/shared/i18n";
import { useThemeTokens } from "@/shared/theme";

interface Props {
  message: string;
}

export function ResetSuccessStep({ message }: Props) {
  const router = useRouter();
  const tokens = useThemeTokens();

  return (
    <View className="flex-1 bg-background justify-center items-center px-6">
      <View className="w-24 h-24 rounded-full bg-successSoft items-center justify-center mb-6">
        <CircleCheck size={48} color={tokens.success} />
      </View>
      <Text className="text-3xl font-bold text-textPrimary text-center">
        {messages.auth.reset.successTitle}
      </Text>
      <Text className="text-base text-textSecondary mt-3 text-center">
        {message}
      </Text>
      <Button
        className="mt-10"
        size="lg"
        fullWidth
        onPress={() => router.replace("/(auth)/login")}
      >
        {messages.auth.reset.successCta}
      </Button>
    </View>
  );
}
