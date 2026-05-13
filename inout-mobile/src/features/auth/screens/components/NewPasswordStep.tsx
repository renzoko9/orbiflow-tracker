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
import { Lock } from "lucide-react-native";
import { Alert, Button, FormField } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { messages } from "@/shared/i18n";
import { useThemeTokens } from "@/shared/theme";
import {
  AUTH_ERROR_CODES,
  newPasswordSchema,
  type NewPasswordFormValues,
} from "../../model";
import { useResetPassword } from "../../api";

interface Props {
  code: string;
  onSuccess: (message: string) => void;
  onCodeExpired: () => void;
}

export function NewPasswordStep({ code, onSuccess, onCodeExpired }: Props) {
  const tokens = useThemeTokens();
  const reset = useResetPassword();
  const [error, setError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit({ password }: NewPasswordFormValues) {
    setError(null);
    reset.mutate(
      { token: code, newPassword: password },
      {
        onSuccess: (response) => onSuccess(response.message),
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.is(AUTH_ERROR_CODES.CODE_EXPIRED)) {
              onCodeExpired();
              return;
            }
            setError(err);
          } else {
            setError(
              new ApiError({ message: messages.auth.reset.genericError }),
            );
          }
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-brandSoft items-center justify-center">
            <Lock size={36} color={tokens.brand} />
          </View>
        </View>

        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-textPrimary">
            {messages.auth.reset.newTitle}
          </Text>
          <Text className="text-base text-textSecondary mt-2 text-center">
            {messages.auth.reset.newSubtitle}
          </Text>
        </View>

        <View className="gap-4">
          <FormField
            control={control}
            name="password"
            label="Nueva contraseña"
            placeholder="Minimo 8 caracteres"
            secureTextEntry
          />
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            secureTextEntry
          />
          {error ? (
            <Alert variant="error" title={error.title} message={error.message} />
          ) : null}
        </View>

        <Button
          className="mt-8"
          size="lg"
          fullWidth
          loading={isSubmitting || reset.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {messages.auth.reset.newSubmit}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
