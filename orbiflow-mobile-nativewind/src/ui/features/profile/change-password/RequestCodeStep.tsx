import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Mail } from "lucide-react-native";
import { Alert, Button } from "@/src/ui/components/atoms";
import AuthService from "@/src/core/services/auth.service";
import { ApiError } from "@/src/core/api/api-error";
import { useAuthStore } from "@/src/core/store";

interface RequestCodeStepProps {
  onCodeSent: () => void;
}

export function RequestCodeStep({ onCodeSent }: RequestCodeStepProps) {
  const email = useAuthStore((s) => s.user?.email ?? "");
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    setApiError(null);
    setIsSending(true);
    try {
      await AuthService.requestChangePasswordCode();
      onCodeSent();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
      } else {
        setApiError(new ApiError({ message: "Error al enviar el código." }));
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="flex-grow justify-center px-6 py-10"
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center mb-6">
        <View className="w-20 h-20 rounded-full bg-primary-1 items-center justify-center">
          <Mail size={36} color="#5f8686" />
        </View>
      </View>

      <View className="mb-8 items-center">
        <Text className="text-3xl font-bold text-gray-900">
          Cambiar contraseña
        </Text>
        <Text className="text-base text-gray-500 mt-2 text-center">
          Por seguridad, te enviaremos un código de 6 dígitos a
        </Text>
        <Text className="text-base font-semibold text-primary-6 mt-1">
          {email}
        </Text>
      </View>

      {apiError && (
        <View className="mb-4">
          <Alert
            variant="error"
            title={apiError.title}
            message={apiError.message}
          />
        </View>
      )}

      <Button
        className="mt-2 w-full"
        size="lg"
        loading={isSending}
        onPress={handleSend}
      >
        Enviar código
      </Button>
    </ScrollView>
  );
}
