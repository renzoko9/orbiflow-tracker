import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, FormField } from "@/src/ui/atoms";
import AuthService from "@/src/core/services/auth.service";
import {
  registerSchema,
  RegisterFormValues,
} from "@/src/core/schemas/auth/register.schema";
import { ApiError } from "@/src/core/api/api-error";

export default function RegisterScreen() {
  const [apiError, setApiError] = useState<ApiError | null>(null);

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

  async function onSubmit({
    confirmPassword: _,
    ...values
  }: RegisterFormValues) {
    setApiError(null);
    try {
      await AuthService.register(values);
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email: values.email },
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err);
      } else {
        setApiError(new ApiError({ message: "Error al crear la cuenta." }));
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
        {/* Header */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">Crear cuenta</Text>
          <Text className="text-base text-gray-500 mt-1">
            Completa el formulario para registrarte
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormField
                control={control}
                name="name"
                label="Nombre"
                placeholder="Ingresa tu nombre"
                autoCapitalize="words"
              />
            </View>
            <View className="flex-1">
              <FormField
                control={control}
                name="lastname"
                label="Apellido"
                placeholder="Ingresa tu apellido"
                autoCapitalize="words"
              />
            </View>
          </View>

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
          <FormField
            control={control}
            name="confirmPassword"
            label="Confirmar contraseña"
            placeholder="Ingresa tu contraseña"
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
          Crear cuenta
        </Button>

        {/* Link a login */}
        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-gray-500">¿Ya tienes cuenta?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-sm text-primary-6 font-semibold">
                Inicia sesión
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
