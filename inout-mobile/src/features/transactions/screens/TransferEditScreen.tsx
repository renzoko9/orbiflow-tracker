import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { Alert, Loading, ScreenHeader, showToast } from "@/shared/ui";
import { TransactionForm } from "../components";
import { useTransfer, useUpdateTransfer } from "../api";

export function TransferEditScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { data: transfer, isLoading, error } = useTransfer(groupId);
  const updateTransfer = useUpdateTransfer();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Editar transferencia" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error || !transfer) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Editar transferencia" />
        <View className="px-4 pt-4">
          <Alert
            variant="error"
            message={error?.message ?? "No se encontro la transferencia"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Editar transferencia" />
      <TransactionForm
        mode="edit"
        initialValues={{
          kind: "transfer",
          amount: transfer.amount,
          description: transfer.description,
          date: transfer.date,
          sourceAccountId: transfer.sourceAccount.id,
          destinationAccountId: transfer.destinationAccount.id,
        }}
        isSubmitting={updateTransfer.isPending}
        onSubmit={(data) => {
          if (data.kind !== "transfer") return;
          updateTransfer.mutate(
            {
              groupId,
              input: {
                amount: data.amount,
                description: data.description,
                date: data.date,
                sourceAccountId: data.sourceAccountId,
                destinationAccountId: data.destinationAccountId,
              },
            },
            {
              onSuccess: (response) => {
                showToast({
                  type: "success",
                  text1: response.title ?? "Transferencia actualizada",
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
          );
        }}
      />
    </SafeAreaView>
  );
}
