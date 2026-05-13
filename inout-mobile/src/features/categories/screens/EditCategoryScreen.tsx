import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/shared/api";
import {
  Alert,
  Loading,
  ScreenHeader,
  showToast,
} from "@/shared/ui";
import { CategoryForm } from "../components";
import { useCategory, useUpdateCategory } from "../api";
import { isGlobalCategory } from "../model";

export function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);

  const { data: category, isLoading, error } = useCategory(categoryId);
  const updateCategory = useUpdateCategory();

  // Categorias globales no se editan.
  useEffect(() => {
    if (category && isGlobalCategory(category)) {
      showToast({
        type: "error",
        text1: "No editable",
        text2: "Las categorias predeterminadas no se pueden editar",
      });
      router.back();
    }
  }, [category, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Editar categoria" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error || !category) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Editar categoria" />
        <View className="px-4 mt-4">
          <Alert
            variant="error"
            message={error?.message ?? "No se pudo cargar la categoria"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title="Editar categoria" />
      <CategoryForm
        mode="edit"
        initialValues={{
          name: category.name,
          type: category.type,
          icon: category.icon,
          color: category.color,
        }}
        isSubmitting={updateCategory.isPending}
        onSubmit={(data) =>
          updateCategory.mutate(
            {
              id: categoryId,
              input: {
                name: data.name,
                icon: data.icon,
                color: data.color,
              },
            },
            {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Categoria actualizada",
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
