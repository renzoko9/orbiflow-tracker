import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { showToast } from "@/src/ui/components/atoms";
import { ScreenHeader } from "@/src/ui/components/molecules";
import { AccountForm } from "@/src/ui/features/accounts";
import { useCreateAccount } from "@/src/ui/hooks";
import { ApiError } from "@/src/core/api/api-error";

export default function CreateAccountScreen() {
  const router = useRouter();
  const createAccount = useCreateAccount();

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Nueva Cuenta" />
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
                  text2: "La cuenta se registró correctamente",
                });
                router.back();
              },
              onError: (error) => {
                const message =
                  error instanceof ApiError
                    ? error.message
                    : "Ocurrió un error inesperado";
                showToast({
                  type: "error",
                  text1: "Error",
                  text2: message,
                });
              },
            },
          )
        }
      />
    </SafeAreaView>
  );
}
