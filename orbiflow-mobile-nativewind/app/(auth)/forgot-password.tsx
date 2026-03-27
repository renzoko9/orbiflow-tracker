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
import { KeyRound } from "lucide-react-native";
import { Alert, Button } from "@/src/ui/components/atoms";
import { FormField } from "@/src/ui/components/molecules";
import AuthService from "@/src/core/services/auth.service";
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/src/core/schemas/auth/forgot-password.schema";
import { ApiError } from "@/src/core/api/api-error";

export default function ForgotPasswordScreen() {
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }: ForgotPasswordFormValues) {
    setApiError(null);
    setSuccessMessage(null);
    try {
      const response = await AuthService.forgotPassword(email);
      setSuccessMessage(response.message);
      router.replace({
        pathname: "/(auth)/reset-password",
        params: { email },
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
      } else {
        setApiError(
          new ApiError({ message: "Error al enviar el código de recuperación." })
        );
      }
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
            <KeyRound size={36} color="#5f8686" />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-gray-900">
            ¿Olvidaste tu contraseña?
          </Text>
          <Text className="text-base text-gray-500 mt-2 text-center">
            Ingresa tu correo y te enviaremos un código para restablecer tu
            contraseña
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <FormField
            control={control}
            name="email"
            label="Correo electrónico"
            placeholder="Ingresa tu correo electrónico"
            keyboardType="email-address"
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
          Enviar código
        </Button>

        {/* Back to login */}
        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-gray-500">¿Recordaste tu contraseña?</Text>
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
