import { useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CircleCheck, Lock } from "lucide-react-native";
import { Alert, Button, ScreenHeader } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { useAuthStore } from "@/shared/auth";
import { messages } from "@/shared/i18n";
import { useThemeTokens } from "@/shared/theme";
import { useRequestChangePasswordCode } from "../api";
import { ChangePasswordCodeStep } from "./components/ChangePasswordCodeStep";
import { NewPasswordStep } from "./components/NewPasswordStep";

type Step = "intro" | "code" | "password" | "success";

export function ChangePasswordScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const email = useAuthStore((s) => s.user?.email ?? "");
  const request = useRequestChangePasswordCode();
  const [step, setStep] = useState<Step>("intro");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [error, setError] = useState<ApiError | null>(null);

  function handleRequestCode() {
    setError(null);
    request.mutate(undefined, {
      onSuccess: () => setStep("code"),
      onError: (err) => {
        if (err instanceof ApiError) setError(err);
        else
          setError(
            new ApiError({ message: messages.auth.changePassword.genericError }),
          );
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <ScreenHeader title={messages.auth.changePassword.header} />

      {step === "intro" && (
        <View className="flex-1 justify-center px-6 pb-10">
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-brandSoft items-center justify-center">
              <Lock size={36} color={tokens.brand} />
            </View>
          </View>

          <View className="mb-8 items-center">
            <Text className="text-3xl font-bold text-textPrimary text-center">
              {messages.auth.changePassword.introTitle}
            </Text>
            <Text className="text-base text-textSecondary mt-2 text-center">
              {messages.auth.changePassword.introSubtitle}
            </Text>
            {email ? (
              <Text className="text-base font-semibold text-brand mt-1">
                {email}
              </Text>
            ) : null}
          </View>

          {error ? (
            <View className="mb-4">
              <Alert variant="error" title={error.title} message={error.message} />
            </View>
          ) : null}

          <Button
            size="lg"
            fullWidth
            loading={request.isPending}
            onPress={handleRequestCode}
          >
            {messages.auth.changePassword.introSubmit}
          </Button>
        </View>
      )}

      {step === "code" && (
        <ChangePasswordCodeStep
          email={email}
          onCodeVerified={(code) => {
            setVerifiedCode(code);
            setStep("password");
          }}
        />
      )}

      {step === "password" && (
        <NewPasswordStep
          code={verifiedCode}
          onSuccess={() => setStep("success")}
          onCodeExpired={() => {
            setVerifiedCode("");
            setStep("code");
          }}
        />
      )}

      {step === "success" && (
        <View className="flex-1 justify-center items-center px-6 pb-10">
          <View className="w-24 h-24 rounded-full bg-successSoft items-center justify-center mb-6">
            <CircleCheck size={48} color={tokens.success} />
          </View>
          <Text className="text-3xl font-bold text-textPrimary text-center">
            {messages.auth.changePassword.successTitle}
          </Text>
          <Text className="text-base text-textSecondary mt-3 text-center">
            {messages.auth.changePassword.successMessage}
          </Text>
          <Button
            className="mt-10"
            size="lg"
            fullWidth
            onPress={() => router.back()}
          >
            {messages.auth.changePassword.successCta}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
