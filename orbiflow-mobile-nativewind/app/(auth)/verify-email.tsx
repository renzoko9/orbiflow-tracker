import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, CircleCheck } from "lucide-react-native";
import { Alert, Button } from "@/src/ui/components/atoms";
import { FormField } from "@/src/ui/components/molecules";
import AuthService from "@/src/core/services/auth.service";
import {
  verifyEmailSchema,
  VerifyEmailFormValues,
} from "@/src/core/schemas/auth/verify-email.schema";
import { ApiError } from "@/src/core/api/api-error";
import { ResponseTypeEnum } from "@/src/core/enums/response-type.enum";
import { EMAIL_REGEX } from "@/src/core/schemas/auth/login.schema";

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  if (!email || !EMAIL_REGEX.test(email)) {
    return <Redirect href="/(auth)/register" />;
  }

  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit({ code }: VerifyEmailFormValues) {
    setApiError(null);
    setSuccessMessage(null);
    try {
      const response = await AuthService.verifyEmail(code);
      setVerifiedMessage(response.message);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
      } else {
        setApiError(new ApiError({ message: "Error al verificar el código." }));
      }
    }
  }

  async function handleResend() {
    if (!email) return;
    setApiError(null);
    setSuccessMessage(null);
    setIsResending(true);
    try {
      const response = await AuthService.resendVerification(email);
      if (response.responseType === ResponseTypeEnum.Success) {
        setSuccessMessage(response.message);
      } else {
        setApiError(new ApiError({ message: response.message }));
      }
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

  if (verifiedMessage) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        {/* Icon */}
        <View className="w-24 h-24 rounded-full bg-success-soft items-center justify-center mb-6">
          <CircleCheck size={48} color="#10b981" />
        </View>

        {/* Message */}
        <Text className="text-3xl font-bold text-primary-7 text-center">
          ¡Cuenta verificada!
        </Text>
        <Text className="text-base text-primary-6 mt-3 text-center">
          {verifiedMessage}
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
            <Mail size={36} color="#5f8686" />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-gray-900">
            Verifica tu correo
          </Text>
          <Text className="text-base text-gray-500 mt-2 text-center">
            Ingresa el código de 6 dígitos que enviamos a
          </Text>
          {email && (
            <Text className="text-base font-semibold text-primary-6 mt-1">
              {email}
            </Text>
          )}
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
          Verificar cuenta
        </Button>

        {/* Resend */}
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

        {/* Back to login */}
        <View className="flex-row justify-center mt-4 gap-1">
          <Text className="text-sm text-gray-500">¿Ya verificaste?</Text>
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
