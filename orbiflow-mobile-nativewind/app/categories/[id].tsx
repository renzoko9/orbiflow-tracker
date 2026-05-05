import {
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, Trash2, RotateCcw } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Alert as AlertBox, showToast } from "@/src/ui/components/atoms";
import {
  ScreenHeader,
  AIInsightsCard,
  KebabMenu,
  type KebabMenuItem,
} from "@/src/ui/components/molecules";
import { CategoryHero } from "@/src/ui/features/categories";
import {
  useCategory,
  useArchiveCategory,
  useRestoreCategory,
} from "@/src/ui/hooks";
import { ApiError } from "@/src/core/api/api-error";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);

  const { data: category, isLoading, error } = useCategory(categoryId);
  const archiveCategory = useArchiveCategory();
  const restoreCategory = useRestoreCategory();

  const isGlobal = category?.userId === null;
  const isArchived =
    category?.archivedAt !== null && category?.archivedAt !== undefined;

  const handleArchive = () => {
    if (!category) return;
    Alert.alert(
      `¿Eliminar "${category.name}"?`,
      "La categoría se archivará: los movimientos históricos seguirán mostrándola, pero ya no aparecerá al registrar nuevos movimientos.\n\nPodrás restaurarla luego desde \"Categorías archivadas\".",
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
                  text1: "Categoría eliminada",
                  text2: `Se archivó "${category.name}"`,
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
            });
          },
        },
      ],
    );
  };

  const handleRestore = () => {
    if (!category) return;
    Alert.alert(
      `¿Restaurar "${category.name}"?`,
      "La categoría volverá a estar activa y aparecerá al registrar nuevos movimientos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: () => {
            restoreCategory.mutate(categoryId, {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Categoría restaurada",
                  text2: `"${category.name}" vuelve a estar activa`,
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
          icon: <RotateCcw size={18} color={colors.text.light} />,
          onPress: handleRestore,
        },
      ]
    : [
        {
          label: "Editar",
          icon: <Pencil size={18} color={colors.text.light} />,
          onPress: () =>
            router.push({
              pathname: "/categories/edit/[id]",
              params: { id: String(categoryId) },
            }),
        },
        {
          label: "Eliminar",
          icon: <Trash2 size={18} color={colors.error.medium} />,
          onPress: handleArchive,
          variant: "danger",
        },
      ];

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader
        title="Detalle de categoría"
        rightAction={
          category && !isGlobal ? <KebabMenu items={menuItems} /> : null
        }
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      ) : error || !category ? (
        <View className="px-4 mt-4">
          <AlertBox
            variant="error"
            message={error?.message ?? "No se pudo cargar la categoría"}
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
              <View className="rounded-2xl bg-primary-1 px-4 py-3 mb-4">
                <Text className="text-sm text-primary-7">
                  Esta es una categoría predeterminada del sistema. No se puede
                  editar ni eliminar.
                </Text>
              </View>
            )}

            {isArchived && !isGlobal && (
              <View className="rounded-2xl bg-primary-1 px-4 py-3 mb-4">
                <Text className="text-sm text-primary-7">
                  Esta categoría está archivada. Los movimientos históricos la
                  conservan, pero no aparece al registrar nuevos.
                </Text>
              </View>
            )}

            {!isArchived && (
              <AIInsightsCard
                title="Análisis inteligente"
                description={`Próximamente: insights específicos sobre tus movimientos en "${category.name}".`}
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
