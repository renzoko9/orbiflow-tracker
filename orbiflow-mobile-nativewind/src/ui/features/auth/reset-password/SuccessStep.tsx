import { View, Text } from "react-native";
import { router } from "expo-router";
import { CircleCheck } from "lucide-react-native";
import { Button } from "@/src/ui/components/atoms";

interface SuccessStepProps {
  message: string;
}

export function SuccessStep({ message }: SuccessStepProps) {
  return (
    <View className="flex-1 bg-white justify-center items-center px-6">
      {/* Icon */}
      <View className="w-24 h-24 rounded-full bg-success-soft items-center justify-center mb-6">
        <CircleCheck size={48} color="#10b981" />
      </View>

      {/* Message */}
      <Text className="text-3xl font-bold text-primary-7 text-center">
        ¡Contraseña restablecida!
      </Text>
      <Text className="text-base text-primary-6 mt-3 text-center">
        {message}
      </Text>

      {/* Go to login */}
      <Button
        className="mt-10 w-full"
        size="lg"
        onPress={() => router.replace("/(auth)/login")}
      >
        Iniciar sesión
      </Button>
    </View>
  );
}
