import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react-native";
import { Alert, Button, FormField } from "@/src/ui/atoms";
import AuthService from "@/src/core/services/auth.service";
import {
  verifyCodeSchema,
  VerifyCodeFormValues,
} from "@/src/core/schemas/auth/reset-password.schema";
import { ApiError } from "@/src/core/api/api-error";

interface VerifyCodeStepProps {
  email: string;
  onCodeVerified: (code: string) => void;
}

export function VerifyCodeStep({ email, onCodeVerified }: VerifyCodeStepProps) {
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

  async function handleResendCode() {
    setApiError(null);
    setSuccessMessage(null);
    setIsResending(true);
    try {
      const response = await AuthService.forgotPassword(email);
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
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-primary-1 items-center justify-center">
            <ShieldCheck size={36} color="#5f8686" />
          </View>
        </View>

        {/* Header */}
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

        {/* Form */}
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

        {/* Submit */}
        <Button
          className="mt-8 w-full"
          size="lg"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          Verificar código
        </Button>

        {/* Resend code */}
        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-gray-500">
            ¿No recibiste el código?
          </Text>
          <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
            <Text
              className={`text-sm font-semibold ${
                isResending ? "text-gray-400" : "text-primary-6"
              }`}
            >
              {isResending ? "Reenviando..." : "Reenviar código"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to login */}
        <View className="flex-row justify-center mt-4 gap-1">
          <Text className="text-sm text-gray-500">
            ¿Recordaste tu contraseña?
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-sm text-primary-6 font-semibold">
              Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
