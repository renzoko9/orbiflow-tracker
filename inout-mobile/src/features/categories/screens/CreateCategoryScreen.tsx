import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import { ScreenHeader, showToast } from "@/shared/ui";
import { CategoryForm } from "../components";
import { useCreateCategory } from "../api";
import { TransactionType } from "../model";

export function CreateCategoryScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const createCategory = useCreateCategory();

  const initialType =
    type === String(TransactionType.INCOME)
      ? TransactionType.INCOME
      : TransactionType.EXPENSE;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Nueva categoria" />
      <CategoryForm
        mode="create"
        initialValues={{ type: initialType }}
        isSubmitting={createCategory.isPending}
        onSubmit={(data) =>
          createCategory.mutate(
            {
              name: data.name,
              type: initialType,
              icon: data.icon,
              color: data.color,
            },
            {
              onSuccess: (response) => {
                showToast({
                  type: "success",
                  text1: response.title ?? "Categoria creada",
                  text2: response.message,
                });
                router.back();
              },
              onError: (error) => {
                const title =
                  error instanceof ApiError ? error.title : undefined;
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
            },
          )
        }
      />
    </SafeAreaView>
  );
}
