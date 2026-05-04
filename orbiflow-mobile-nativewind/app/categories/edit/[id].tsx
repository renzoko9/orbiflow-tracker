import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/src/ui/theme/colors";
import { showToast, Alert as AlertBox } from "@/src/ui/components/atoms";
import { ScreenHeader } from "@/src/ui/components/molecules";
import { CategoryForm } from "@/src/ui/features/categories";
import { useCategory, useUpdateCategory } from "@/src/ui/hooks";
import { ApiError } from "@/src/core/api/api-error";

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);

  const { data: category, isLoading, error } = useCategory(categoryId);
  const updateCategory = useUpdateCategory(categoryId);

  // Si la categoría es global, no se puede editar — vuelve atrás
  useEffect(() => {
    if (category && category.userId === null) {
      showToast({
        type: "error",
        text1: "No editable",
        text2: "Las categorías predeterminadas no se pueden editar",
      });
      router.back();
    }
  }, [category, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Editar categoría" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !category) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Editar categoría" />
        <View className="px-4 mt-4">
          <AlertBox
            variant="error"
            message={error?.message ?? "No se pudo cargar la categoría"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Editar categoría" />
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
              name: data.name,
              icon: data.icon,
              color: data.color,
            },
            {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Categoría actualizada",
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
