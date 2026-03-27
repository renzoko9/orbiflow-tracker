import { useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { EMAIL_REGEX } from "@/src/core/schemas/auth/login.schema";
import {
  VerifyCodeStep,
  NewPasswordStep,
  SuccessStep,
} from "@/src/ui/common/reset-password";

type Step = "code" | "password" | "success";

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  if (!email || !EMAIL_REGEX.test(email)) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  const [step, setStep] = useState<Step>("code");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleCodeVerified(code: string) {
    setVerifiedCode(code);
    setStep("password");
  }

  function handleSuccess(message: string) {
    setSuccessMessage(message);
    setStep("success");
  }

  function handleCodeExpired() {
    setVerifiedCode("");
    setStep("code");
  }

  if (step === "success") {
    return <SuccessStep message={successMessage} />;
  }

  if (step === "password") {
    return (
      <NewPasswordStep
        code={verifiedCode}
        onSuccess={handleSuccess}
        onCodeExpired={handleCodeExpired}
      />
    );
  }

  // step === "code"
  return <VerifyCodeStep email={email} onCodeVerified={handleCodeVerified} />;
}
