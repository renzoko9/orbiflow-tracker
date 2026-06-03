import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, FormField } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { messages } from "@/shared/i18n";
import {
  loginSchema,
  type LoginFormValues,
  AUTH_ERROR_CODES,
} from "../model";
import { useLogin } from "../api";

export function LoginScreen() {
  const router = useRouter();
  const login = useLogin();
  const [error, setError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    getValues,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    setError(null);
    login.mutate(values, {
      onSuccess: () => {
        router.replace("/(tabs)/home");
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.is(AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED)) {
            const email = getValues("email");
            router.push({
              pathname: "/(auth)/verify-email",
              params: { email, autoResend: "true" },
            });
            return;
          }
          setError(err);
        } else {
          setError(new ApiError({ message: messages.auth.login.genericError }));
        }
      },
    });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text className="text-3xl font-bold text-textPrimary">
            {messages.auth.login.title}
          </Text>
          <Text className="text-base text-textSecondary mt-1">
            {messages.auth.login.subtitle}
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
          <FormField
            control={control}
            name="password"
            label="Contraseña"
            placeholder="Tu contraseña"
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            className="self-end"
            onPress={() => router.push("/(auth)/forgot-password")}
            hitSlop={8}
          >
            <Text className="text-sm font-medium text-brand">
              {messages.auth.login.forgotLink}
            </Text>
          </TouchableOpacity>

          {error ? (
            <Alert variant="error" title={error.title} message={error.message} />
          ) : null}
        </View>

        <Button
          className="mt-8"
          size="lg"
          fullWidth
          loading={isSubmitting || login.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {messages.auth.login.submit}
        </Button>

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-textSecondary">
            {messages.auth.login.noAccount}
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity hitSlop={6}>
              <Text className="text-sm font-semibold text-brand">
                {messages.auth.login.goRegister}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
