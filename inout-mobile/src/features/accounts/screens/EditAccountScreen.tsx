import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { Alert, Loading, ScreenHeader, showToast } from "@/shared/ui";
import { AccountForm } from "../components";
import { useAccount, useUpdateAccount } from "../api";

export function EditAccountScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const { data: account, isLoading, error } = useAccount(accountId);
  const updateAccount = useUpdateAccount();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Editar cuenta" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error || !account) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Editar cuenta" />
        <View className="px-4 mt-4">
          <Alert
            variant="error"
            message={error?.message ?? "No se pudo cargar la cuenta"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Editar cuenta" />
      <AccountForm
        mode="edit"
        initialValues={{
          name: account.name,
          balance: account.balance,
          description: account.description,
          icon: account.icon,
          color: account.color,
        }}
        isSubmitting={updateAccount.isPending}
        onSubmit={(data) =>
          updateAccount.mutate(
            {
              id: accountId,
              input: {
                name: data.name,
                description: data.description,
                icon: data.icon,
                color: data.color,
              },
            },
            {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Cuenta actualizada",
                  text2: "Los cambios se guardaron correctamente",
                });
                router.back();
              },
              onError: (err) => {
                const message =
                  err instanceof ApiError
                    ? err.message
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
