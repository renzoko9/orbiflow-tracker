import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { showToast } from "@/src/ui/components/atoms";
import { ScreenHeader } from "@/src/ui/components/molecules";
import { CategoryForm } from "@/src/ui/features/categories";
import { useCreateCategory } from "@/src/ui/hooks";
import { ApiError } from "@/src/core/api/api-error";
import { CategoryType } from "@/src/core/enums/category-type.enum";

export default function CreateCategoryScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const createCategory = useCreateCategory();

  const initialType =
    type === String(CategoryType.INCOME)
      ? CategoryType.INCOME
      : CategoryType.EXPENSE;

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Nueva Categoría" />
      <CategoryForm
        mode="create"
        initialValues={{ type: initialType }}
        isSubmitting={createCategory.isPending}
        onSubmit={(data) =>
          createCategory.mutate(
            {
              name: data.name,
              type: data.type ?? initialType,
              icon: data.icon,
              color: data.color,
            },
            {
              onSuccess: (response) => {
                showToast({
                  type: "success",
                  text1: response.title ?? "Categoría creada",
                  text2: response.message,
                });
                router.back();
              },
              onError: (error) => {
                const title = error instanceof ApiError ? error.title : undefined;
                const message =
                  error instanceof ApiError
                    ? error.message
                    : "Ocurrió un error inesperado";
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
