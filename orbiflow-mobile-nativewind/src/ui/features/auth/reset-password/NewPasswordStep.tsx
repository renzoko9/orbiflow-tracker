import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react-native";
import { Alert, Button } from "@/src/ui/components/atoms";
import { FormField } from "@/src/ui/components/molecules";
import AuthService from "@/src/core/services/auth.service";
import {
  newPasswordSchema,
  NewPasswordFormValues,
} from "@/src/core/schemas/auth/reset-password.schema";
import { ApiError } from "@/src/core/api/api-error";

interface NewPasswordStepProps {
  code: string;
  onSuccess: (message: string) => void;
  onCodeExpired: () => void;
}

export function NewPasswordStep({
  code,
  onSuccess,
  onCodeExpired,
}: NewPasswordStepProps) {
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit({ newPassword }: NewPasswordFormValues) {
    setApiError(null);
    try {
      const response = await AuthService.resetPassword(code, newPassword);
      onSuccess(response.message);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
        if (err.status === 400) {
          onCodeExpired();
        }
      } else {
        setApiError(
          new ApiError({ message: "Error al restablecer la contraseña." }),
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
            <LockKeyhole size={36} color="#5f8686" />
          </View>
        </View>

        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-gray-900">
            Nueva contraseña
          </Text>
          <Text className="text-base text-gray-500 mt-2 text-center">
            Ingresa tu nueva contraseña para completar el restablecimiento
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <FormField
            control={control}
            name="newPassword"
            label="Nueva contraseña"
            placeholder="Ingresa tu nueva contraseña"
            secureTextEntry
          />
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirmar contraseña"
            placeholder="Confirma tu nueva contraseña"
            secureTextEntry
          />

          {apiError && (
            <Alert
              variant="error"
              title={apiError.title}
              message={apiError.message}
            />
          )}
        </View>

        {/* Submit */}
        <Button
          className="mt-8 w-full"
          size="lg"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        >
          Restablecer contraseña
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
