import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { Button, Input } from "@/src/ui/atoms";
import AuthService from "@/src/core/services/auth.service";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Completa todos los campos.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await AuthService.login({ email, password });
      router.replace("/(tabs)/inicio");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar sesión.";
      setError(message);
    } finally {
      setLoading(false);
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
          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <Text className="text-sm text-red-500">{error}</Text>
          ) : null}

          <TouchableOpacity className="self-end">
            <Text className="text-sm text-primary-6 font-medium">
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <Button
          className="mt-8 w-full"
          size="lg"
          loading={loading}
          onPress={handleLogin}
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
