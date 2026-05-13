import { Alert as RNAlert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, RotateCcw, Trash2 } from "lucide-react-native";
import { ApiError } from "@/shared/api";
import {
  Alert as AlertBox,
  KebabMenu,
  Loading,
  ScreenHeader,
  showToast,
  type KebabMenuItem,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { CategoryHero } from "../components";
import {
  useArchiveCategory,
  useCategory,
  useRestoreCategory,
} from "../api";
import { isArchivedCategory, isGlobalCategory } from "../model";

export function CategoryDetailScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);

  const { data: category, isLoading, error } = useCategory(categoryId);
  const archiveCategory = useArchiveCategory();
  const restoreCategory = useRestoreCategory();

  const isGlobal = category ? isGlobalCategory(category) : false;
  const isArchived = category ? isArchivedCategory(category) : false;

  const handleArchive = () => {
    if (!category) return;
    RNAlert.alert(
      `Eliminar "${category.name}"?`,
      'La categoria se archivara: los movimientos historicos seguiran mostrandola, pero ya no aparecera al registrar nuevos movimientos.\n\nPodras restaurarla luego desde "Categorias archivadas".',
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            archiveCategory.mutate(categoryId, {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Categoria eliminada",
                  text2: `Se archivo "${category.name}"`,
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
            });
          },
        },
      ],
    );
  };

  const handleRestore = () => {
    if (!category) return;
    RNAlert.alert(
      `Restaurar "${category.name}"?`,
      "La categoria volvera a estar activa y aparecera al registrar nuevos movimientos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: () => {
            restoreCategory.mutate(categoryId, {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Categoria restaurada",
                  text2: `"${category.name}" vuelve a estar activa`,
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
            });
          },
        },
      ],
    );
  };

  const menuItems: KebabMenuItem[] = isArchived
    ? [
        {
          label: "Restaurar",
          icon: <RotateCcw size={18} color={tokens.textPrimary} />,
          onPress: handleRestore,
        },
      ]
    : [
        {
          label: "Editar",
          icon: <Pencil size={18} color={tokens.textPrimary} />,
          onPress: () =>
            router.push({
              pathname: "/categories/edit/[id]",
              params: { id: String(categoryId) },
            }),
        },
        {
          label: "Eliminar",
          icon: <Trash2 size={18} color={tokens.danger} />,
          onPress: handleArchive,
          variant: "danger",
        },
      ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        title="Detalle de categoria"
        rightAction={
          category && !isGlobal ? <KebabMenu items={menuItems} /> : null
        }
      />

      {isLoading ? (
        <Loading />
      ) : error || !category ? (
        <View className="px-4 mt-4">
          <AlertBox
            variant="error"
            message={error?.message ?? "No se pudo cargar la categoria"}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <CategoryHero
            name={category.name}
            type={category.type}
            icon={category.icon}
            color={category.color}
            isGlobal={isGlobal}
          />

          <View className="px-4">
            {isGlobal && (
              <View className="rounded-2xl bg-brandSoft px-4 py-3 mb-4">
                <Text className="text-sm text-brand">
                  Esta es una categoria predeterminada del sistema. No se puede
                  editar ni eliminar.
                </Text>
              </View>
            )}

            {isArchived && !isGlobal && (
              <View className="rounded-2xl bg-brandSoft px-4 py-3 mb-4">
                <Text className="text-sm text-brand">
                  Esta categoria esta archivada. Los movimientos historicos la
                  conservan, pero no aparece al registrar nuevos.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
