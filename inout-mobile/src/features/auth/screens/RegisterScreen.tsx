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
import { registerSchema, type RegisterFormValues } from "../model";
import { useRegister } from "../api";

export function RegisterScreen() {
  const router = useRouter();
  const register = useRegister();
  const [error, setError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterFormValues) {
    setError(null);
    const { confirmPassword: _, ...payload } = values;
    register.mutate(payload, {
      onSuccess: () => {
        router.replace({
          pathname: "/(auth)/verify-email",
          params: { email: values.email },
        });
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(
            new ApiError({ message: messages.auth.register.genericError }),
          );
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
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-10"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text className="text-3xl font-bold text-textPrimary">
            {messages.auth.register.title}
          </Text>
          <Text className="text-base text-textSecondary mt-1">
            {messages.auth.register.subtitle}
          </Text>
        </View>

        <View className="gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormField
                control={control}
                name="name"
                label="Nombre"
                placeholder="Tu nombre"
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <FormField
                control={control}
                name="lastname"
                label="Apellido"
                placeholder="Tu apellido"
                autoCapitalize="words"
              />
            </View>
          </View>

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
          loading={isSubmitting || register.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {messages.auth.register.submit}
        </Button>

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-textSecondary">
            {messages.auth.register.haveAccount}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity hitSlop={6}>
              <Text className="text-sm font-semibold text-brand">
                {messages.auth.register.goLogin}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
