import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/src/ui/components/molecules";
import {
  RequestCodeStep,
  VerifyCodeStep,
  NewPasswordStep,
  SuccessStep,
} from "@/src/ui/features/profile";

type Step = "request" | "verify" | "password" | "success";

export default function ChangePasswordScreen() {
  const [step, setStep] = useState<Step>("request");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleCodeSent() {
    setStep("verify");
  }

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
    setStep("request");
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {step !== "success" && <ScreenHeader title="Cambiar contraseña" />}
        {step === "request" && <RequestCodeStep onCodeSent={handleCodeSent} />}
        {step === "verify" && (
          <VerifyCodeStep onCodeVerified={handleCodeVerified} />
        )}
        {step === "password" && (
          <NewPasswordStep
            code={verifiedCode}
            onSuccess={handleSuccess}
            onCodeExpired={handleCodeExpired}
          />
        )}
        {step === "success" && <SuccessStep message={successMessage} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
