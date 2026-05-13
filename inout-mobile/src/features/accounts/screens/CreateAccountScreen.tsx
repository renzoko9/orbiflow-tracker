import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { ScreenHeader, showToast } from "@/shared/ui";
import { AccountForm } from "../components";
import { useCreateAccount } from "../api";

export function CreateAccountScreen() {
  const router = useRouter();
  const createAccount = useCreateAccount();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Nueva cuenta" />
      <AccountForm
        mode="create"
        isSubmitting={createAccount.isPending}
        onSubmit={(data) =>
          createAccount.mutate(
            {
              name: data.name,
              balance: data.balance,
              description: data.description,
              icon: data.icon,
              color: data.color,
            },
            {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Cuenta creada",
                  text2: "La cuenta se registro correctamente",
                });
                router.back();
              },
              onError: (error) => {
                const message =
                  error instanceof ApiError
                    ? error.message
                    : "Ocurrio un error inesperado";
                showToast({ type: "error", text1: "Error", text2: message });
              },
            },
          )
        }
      />
    </SafeAreaView>
  );
}
