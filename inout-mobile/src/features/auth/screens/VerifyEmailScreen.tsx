import { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Mail } from "lucide-react-native";
import { Alert, Button, CodeField } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { messages } from "@/shared/i18n";
import { useThemeTokens } from "@/shared/theme";
import {
  EMAIL_REGEX,
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "../model";
import { useResendVerification, useVerifyEmail } from "../api";

export function VerifyEmailScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { email, autoResend } = useLocalSearchParams<{
    email: string;
    autoResend?: string;
  }>();

  if (!email || !EMAIL_REGEX.test(email)) {
    return <Redirect href="/(auth)/register" />;
  }

  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [error, setError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verifiedMessage, setVerifiedMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (autoResend === "true") {
      handleResend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit({ code }: VerifyEmailFormValues) {
    setError(null);
    setSuccess(null);
    verify.mutate(code, {
      onSuccess: (response) => setVerifiedMessage(response.message),
      onError: (err) => {
        if (err instanceof ApiError) setError(err);
        else
          setError(
            new ApiError({ message: messages.auth.verifyEmail.genericError }),
          );
      },
    });
  }

  function handleResend() {
    setError(null);
    setSuccess(null);
    resend.mutate(email, {
      onSuccess: (response) => {
        setSuccess(response.message);
        reset({ code: "" });
      },
      onError: (err) => {
        if (err instanceof ApiError) setError(err);
        else
          setError(
            new ApiError({ message: messages.auth.verifyEmail.resendError }),
          );
      },
    });
  }

  if (verifiedMessage) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <View className="w-24 h-24 rounded-full bg-successSoft items-center justify-center mb-6">
          <CircleCheck size={48} color={tokens.success} />
        </View>
        <Text className="text-3xl font-bold text-textPrimary text-center">
          {messages.auth.verifyEmail.verified}
        </Text>
        <Text className="text-base text-textSecondary mt-3 text-center">
          {verifiedMessage}
        </Text>
        <Button
          className="mt-10"
          size="lg"
          fullWidth
          onPress={() => router.replace("/(auth)/login")}
        >
          {messages.auth.verifyEmail.goLogin}
        </Button>
      </View>
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
            <Mail size={36} color={tokens.brand} />
          </View>
        </View>

        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-textPrimary">
            {messages.auth.verifyEmail.title}
          </Text>
          <Text className="text-base text-textSecondary mt-2 text-center">
            {messages.auth.verifyEmail.subtitle}
          </Text>
          <Text className="text-base font-semibold text-brand mt-1">
            {email}
          </Text>
        </View>

        <View className="gap-4">
          <CodeField
            control={control}
            name="code"
            label="Codigo de verificacion"
            autoFocus
          />

          {error ? (
            <Alert variant="error" title={error.title} message={error.message} />
          ) : null}
          {success ? <Alert variant="success" message={success} /> : null}
        </View>

        <Button
          className="mt-8"
          size="lg"
          fullWidth
          loading={isSubmitting || verify.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          {messages.auth.verifyEmail.submit}
        </Button>

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-sm text-textSecondary">
            {messages.auth.verifyEmail.noCode}
          </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resend.isPending}
            hitSlop={6}
          >
            <Text
              className={`text-sm font-semibold ${
                resend.isPending ? "text-textDisabled" : "text-brand"
              }`}
            >
              {resend.isPending
                ? messages.auth.verifyEmail.resending
                : messages.auth.verifyEmail.resend}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
