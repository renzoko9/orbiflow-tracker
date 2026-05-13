import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { ScreenHeader, showToast } from "@/shared/ui";
import { TransactionForm } from "../components";
import { useCreateTransaction } from "../api";

export function CreateTransactionScreen() {
  const router = useRouter();
  const createTransaction = useCreateTransaction();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Nuevo movimiento" />
      <TransactionForm
        mode="create"
        isSubmitting={createTransaction.isPending}
        onSubmit={(data) =>
          createTransaction.mutate(data, {
            onSuccess: (response) => {
              showToast({
                type: "success",
                text1: response.title ?? "Movimiento creado",
                text2: response.message,
              });
              router.back();
            },
            onError: (error) => {
              const title = error instanceof ApiError ? error.title : undefined;
              const message =
                error instanceof ApiError
                  ? error.message
                  : "Ocurrio un error inesperado";
              showToast({
                type: "error",
                text1: title ?? "Error",
                text2: message,
              });
            },
          })
        }
      />
    </SafeAreaView>
  );
}
