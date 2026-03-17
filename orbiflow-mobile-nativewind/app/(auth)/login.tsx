import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, FormField } from "@/src/ui/atoms";
import AuthService from "@/src/core/services/auth.service";
import {
  loginSchema,
  LoginFormValues,
} from "@/src/core/schemas/auth/login.schema";
import { ApiError } from "@/src/core/api/api-error";

export default function LoginScreen() {
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    try {
      await AuthService.login(values);
      router.replace("/(tabs)/inicio");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
      } else {
        setApiError(new ApiError({ message: "Error al iniciar sesión." }));
      }
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 justify-center px-6">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">Bienvenido</Text>
          <Text className="text-base text-gray-500 mt-1">
            Ingresa tus datos para continuar
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
          <FormField
            control={control}
            name="password"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            secureTextEntry
          />

          <TouchableOpacity className="self-end">
            <Text className="text-sm text-primary-6 font-medium">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {apiError && (
            <Alert
              variant="info"
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
          Iniciar sesión
        </Button>

        {/* Link a registro */}
        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-gray-500">¿No tienes cuenta?</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-sm text-primary-6 font-semibold">
                Regístrate
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
