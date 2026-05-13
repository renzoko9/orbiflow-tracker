import { useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { EMAIL_REGEX } from "../model";
import { VerifyResetCodeStep } from "./components/VerifyResetCodeStep";
import { NewPasswordStep } from "./components/NewPasswordStep";
import { ResetSuccessStep } from "./components/ResetSuccessStep";

type Step = "code" | "password" | "success";

export function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  if (!email || !EMAIL_REGEX.test(email)) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  const [step, setStep] = useState<Step>("code");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (step === "success") {
    return <ResetSuccessStep message={successMessage} />;
  }

  if (step === "password") {
    return (
      <NewPasswordStep
        code={verifiedCode}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          setStep("success");
        }}
        onCodeExpired={() => {
          setVerifiedCode("");
          setStep("code");
        }}
      />
    );
  }

  return (
    <VerifyResetCodeStep
      email={email}
      onCodeVerified={(code) => {
        setVerifiedCode(code);
        setStep("password");
      }}
    />
  );
}
