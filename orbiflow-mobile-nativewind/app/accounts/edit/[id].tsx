import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/src/ui/theme/colors";
import { showToast, Alert as AlertBox } from "@/src/ui/components/atoms";
import { ScreenHeader } from "@/src/ui/components/molecules";
import { AccountForm } from "@/src/ui/features/accounts";
import { useAccount, useUpdateAccount } from "@/src/ui/hooks";
import { ApiError } from "@/src/core/api/api-error";

export default function EditAccountScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const { data: account, isLoading, error } = useAccount(accountId);
  const updateAccount = useUpdateAccount(accountId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Editar cuenta" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !account) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Editar cuenta" />
        <View className="px-4 mt-4">
          <AlertBox
            variant="error"
            message={error?.message ?? "No se pudo cargar la cuenta"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-inverse">
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
              name: data.name,
              description: data.description,
              icon: data.icon,
              color: data.color,
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
