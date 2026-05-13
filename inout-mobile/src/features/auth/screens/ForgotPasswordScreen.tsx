import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react-native";
import { Alert, Button, FormField } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { messages } from "@/shared/i18n";
import { useThemeTokens } from "@/shared/theme";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../model";
import { useForgotPassword } from "../api";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const forgot = useForgotPassword();
  const [error, setError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit({ email }: ForgotPasswordFormValues) {
    setError(null);
    forgot.mutate(email, {
      onSuccess: () => {
        router.replace({
          pathname: "/(auth)/reset-password",
          params: { email },
        });
      },
      onError: (err) => {
        if (err instanceof ApiError) setError(err);
        else
          setError(new ApiError({ message: messages.auth.forgot.genericError }));
      },
    });
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
            <KeyRound size={36} color={tokens.brand} />
          </View>
        </View>

        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-textPrimary">
            {messages.auth.forgot.title}
          </Text>
          <Text className="text-base text-textSecondary mt-2 text-center">
            {messages.auth.forgot.subtitle}
          </Text>
        </View>

        <View className="gap-4">
          <FormField
            control={control}
            name="email"
            label="Correo electronico"
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {error ? (
            <Alert variant="error" title={error.title} message={error.message} />
          ) : null}
        </View>

        <Button
          className="mt-8"
          size="lg"
          fullWidth
          loading={isSubmitting || forgot.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {messages.auth.forgot.submit}
        </Button>

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-textSecondary">
            {messages.auth.forgot.remembered}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            hitSlop={6}
          >
            <Text className="text-sm font-semibold text-brand">
              {messages.auth.forgot.goLogin}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
