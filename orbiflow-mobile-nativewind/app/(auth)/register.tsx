import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Button, Input } from "@/src/ui/atoms";

export default function RegisterScreen() {
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
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            autoCapitalize="words"
          />
          <Input
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
          />
          <Input
            label="Confirmar contraseña"
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        {/* Submit */}
        <Button className="mt-8 w-full" size="lg">
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
