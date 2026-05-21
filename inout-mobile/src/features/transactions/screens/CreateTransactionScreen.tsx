import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { ScreenHeader, showToast } from "@/shared/ui";
import { TransactionForm } from "../components";
import { useCreateTransaction, useCreateTransfer } from "../api";

export function CreateTransactionScreen() {
  const router = useRouter();
  const createTransaction = useCreateTransaction();
  const createTransfer = useCreateTransfer();

  const isSubmitting =
    createTransaction.isPending || createTransfer.isPending;

  const handleError = (error: unknown) => {
    const title = error instanceof ApiError ? error.title : undefined;
    const message =
      error instanceof ApiError
        ? error.message
        : "Ocurrio un error inesperado";
    showToast({ type: "error", text1: title ?? "Error", text2: message });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Nuevo registro" />
      <TransactionForm
        mode="create"
        isSubmitting={isSubmitting}
        onSubmit={(data) => {
          if (data.kind === "movement") {
            createTransaction.mutate(
              {
                amount: data.amount,
                description: data.description,
                type: data.type,
                date: data.date,
                categoryId: data.categoryId,
                accountId: data.accountId,
              },
              {
                onSuccess: (response) => {
                  showToast({
                    type: "success",
                    text1: response.title ?? "Movimiento creado",
                    text2: response.message,
                  });
                  router.back();
                },
                onError: handleError,
              },
            );
            return;
          }
          createTransfer.mutate(
            {
              amount: data.amount,
              description: data.description,
              date: data.date,
              sourceAccountId: data.sourceAccountId,
              destinationAccountId: data.destinationAccountId,
            },
            {
              onSuccess: (response) => {
                showToast({
                  type: "success",
                  text1: response.title ?? "Transferencia creada",
                  text2: response.message,
                });
                router.back();
              },
              onError: handleError,
            },
          );
        }}
      />
    </SafeAreaView>
  );
}
