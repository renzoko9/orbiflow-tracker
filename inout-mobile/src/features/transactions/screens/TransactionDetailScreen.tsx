import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { Alert, Loading, ScreenHeader, showToast } from "@/shared/ui";
import { TransactionForm } from "../components";
import { useTransaction, useUpdateTransaction } from "../api";

export function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);

  const {
    data: transaction,
    isLoading,
    error,
  } = useTransaction(transactionId);
  const updateTransaction = useUpdateTransaction();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Detalle" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Detalle" />
        <View className="px-4 pt-4">
          <Alert
            variant="error"
            message={error?.message ?? "No se encontro el movimiento"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Editar movimiento" />
      <TransactionForm
        mode="edit"
        initialValues={{
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          accountId: transaction.account.id,
          categoryId: transaction.category?.id,
          description: transaction.description,
        }}
        isSubmitting={updateTransaction.isPending}
        onSubmit={(data) =>
          updateTransaction.mutate(
            { id: transactionId, input: data },
            {
              onSuccess: (response) => {
                showToast({
                  type: "success",
                  text1: response.title ?? "Movimiento actualizado",
                  text2: response.message,
                });
                router.back();
              },
              onError: (err) => {
                const title = err instanceof ApiError ? err.title : undefined;
                const message =
                  err instanceof ApiError
                    ? err.message
                    : "Ocurrio un error inesperado";
                showToast({
                  type: "error",
                  text1: title ?? "Error",
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
