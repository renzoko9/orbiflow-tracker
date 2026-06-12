import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react-native";
import { Alert, Button, CodeField } from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { messages } from "@/shared/i18n";
import { useThemeTokens } from "@/shared/theme";
import { verifyCodeSchema, type VerifyCodeFormValues } from "../../model";
import { useForgotPassword, useVerifyResetCode } from "../../api";

interface Props {
  email: string;
  onCodeVerified: (code: string) => void;
}

export function VerifyResetCodeStep({ email, onCodeVerified }: Props) {
  const tokens = useThemeTokens();
  const verify = useVerifyResetCode();
  const resend = useForgotPassword();
  const [error, setError] = useState<ApiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: "" },
  });

  function onSubmit({ code }: VerifyCodeFormValues) {
    setError(null);
    setSuccess(null);
    verify.mutate(code, {
      onSuccess: () => onCodeVerified(code),
      onError: (err) => {
        if (err instanceof ApiError) setError(err);
        else
          setError(new ApiError({ message: messages.auth.reset.genericError }));
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
            <ShieldCheck size={36} color={tokens.brand} />
          </View>
        </View>

        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-textPrimary">
            {messages.auth.reset.verifyTitle}
          </Text>
          <Text className="text-base text-textSecondary mt-2 text-center">
            {messages.auth.reset.verifySubtitle}
          </Text>
          <Text className="text-base font-semibold text-brand mt-1">
            {email}
          </Text>
        </View>

        <View className="gap-4">
          <CodeField control={control} name="code" label="Codigo" autoFocus />
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
          {messages.auth.reset.verifySubmit}
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
