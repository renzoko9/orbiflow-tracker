import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react-native";
import { Alert, Button } from "@/src/ui/components/atoms";
import { FormField } from "@/src/ui/components/molecules";
import AuthService from "@/src/core/services/auth.service";
import {
  verifyCodeSchema,
  VerifyCodeFormValues,
} from "@/src/core/schemas/auth/reset-password.schema";
import { ApiError } from "@/src/core/api/api-error";
import { useAuthStore } from "@/src/core/store";

interface VerifyCodeStepProps {
  onCodeVerified: (code: string) => void;
}

export function VerifyCodeStep({ onCodeVerified }: VerifyCodeStepProps) {
  const email = useAuthStore((s) => s.user?.email ?? "");
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit({ code }: VerifyCodeFormValues) {
    setApiError(null);
    setSuccessMessage(null);
    try {
      await AuthService.verifyResetCode(code);
      onCodeVerified(code);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
      } else {
        setApiError(new ApiError({ message: "Error al verificar el código." }));
      }
    }
  }

  async function handleResend() {
    setApiError(null);
    setSuccessMessage(null);
    setIsResending(true);
    try {
      const response = await AuthService.requestChangePasswordCode();
      setSuccessMessage(response.message);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
      } else {
        setApiError(new ApiError({ message: "Error al reenviar el código." }));
      }
    } finally {
      setIsResending(false);
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
          <ShieldCheck size={36} color="#5f8686" />
        </View>
      </View>

      <View className="mb-8 items-center">
        <Text className="text-3xl font-bold text-gray-900">
          Verificar código
        </Text>
        <Text className="text-base text-gray-500 mt-2 text-center">
          Ingresa el código de 6 dígitos que enviamos a
        </Text>
        <Text className="text-base font-semibold text-primary-6 mt-1">
          {email}
        </Text>
      </View>

      <View className="gap-4">
        <FormField
          control={control}
          name="code"
          label="Código de verificación"
          placeholder="Ingresa el código de 6 dígitos"
          keyboardType="number-pad"
          autoCapitalize="none"
        />

        {apiError && (
          <Alert
            variant="error"
            title={apiError.title}
            message={apiError.message}
          />
        )}

        {successMessage && (
          <Alert variant="success" message={successMessage} />
        )}
      </View>

      <Button
        className="mt-8 w-full"
        size="lg"
        loading={isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        Verificar código
      </Button>

      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-sm text-gray-500">
          ¿No recibiste el código?
        </Text>
        <TouchableOpacity onPress={handleResend} disabled={isResending}>
          <Text
            className={`text-sm font-semibold ${
              isResending ? "text-gray-400" : "text-primary-6"
            }`}
          >
            {isResending ? "Reenviando..." : "Reenviar código"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
