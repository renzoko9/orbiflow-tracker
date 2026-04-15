import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colors } from "@/src/ui/theme/colors";
import { Button, showToast, CircleSelector } from "@/src/ui/components/atoms";
import type { CircleSelectorItem } from "@/src/ui/components/atoms";
import { FormField, ScreenHeader } from "@/src/ui/components/molecules";
import {
  createCategorySchema,
  CreateCategoryFormValues,
} from "@/src/core/schemas/category/create-category.schema";
import { useCreateCategory } from "@/src/ui/hooks";
import { ApiError } from "@/src/core/api/api-error";
import { getIconComponent } from "@/src/ui/utils/icon-map";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_COLOR,
} from "@/src/core/constants/category.constant";

function buildIconItems(selectedColor: string): CircleSelectorItem[] {
  return CATEGORY_ICONS.map((iconName, index) => {
    const IconComp = getIconComponent(iconName);
    return {
      id: index,
      label: "",
      icon: <IconComp size={22} color={colors.inverse} />,
      color: selectedColor,
    };
  });
}

const colorItems: CircleSelectorItem[] = CATEGORY_COLORS.map((c, index) => ({
  id: index,
  label: "",
  icon: null,
  color: c,
}));

export default function CreateCategoryScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const createCategory = useCreateCategory();

  const initialType =
    type === String(CategoryType.INCOME)
      ? CategoryType.INCOME
      : CategoryType.EXPENSE;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      type: initialType,
      icon: DEFAULT_CATEGORY_ICON,
      color: DEFAULT_CATEGORY_COLOR,
    },
  });

  const selectedColor = watch("color") ?? DEFAULT_CATEGORY_COLOR;
  const iconItems = buildIconItems(selectedColor);

  const onSubmit = (data: CreateCategoryFormValues) => {
    createCategory.mutate(
      {
        name: data.name,
        type: data.type,
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
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Nueva Categoría" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tipo */}
          <View className="gap-2">
            <Text className="text-base text-text-light">Tipo</Text>
            <View className="bg-primary-1 rounded-lg px-4 py-3">
              <Text className="text-base text-primary-7 font-medium">
                {initialType === CategoryType.INCOME ? "Ingreso" : "Gasto"}
              </Text>
            </View>
          </View>

          {/* Icono */}
          <View className="gap-2">
            <Text className="text-base text-text-light">Icono</Text>
            <Controller
              control={control}
              name="icon"
              render={({ field: { value, onChange } }) => (
                <CircleSelector
                  items={iconItems}
                  selectedId={CATEGORY_ICONS.indexOf(
                    (value ??
                      DEFAULT_CATEGORY_ICON) as (typeof CATEGORY_ICONS)[number],
                  )}
                  onSelect={(id) => onChange(CATEGORY_ICONS[id])}
                  layout="scroll"
                  circleSize={56}
                  itemWidth={56}
                />
              )}
            />
            {errors.icon && (
              <Text className="text-error-medium text-sm">
                {errors.icon.message}
              </Text>
            )}
          </View>

          {/* Color */}
          <View className="gap-2">
            <Text className="text-base text-text-light">Color</Text>
            <Controller
              control={control}
              name="color"
              render={({ field: { value, onChange } }) => (
                <CircleSelector
                  items={colorItems}
                  selectedId={CATEGORY_COLORS.indexOf(
                    (value ??
                      DEFAULT_CATEGORY_COLOR) as (typeof CATEGORY_COLORS)[number],
                  )}
                  onSelect={(id) => onChange(CATEGORY_COLORS[id])}
                  layout="scroll"
                  circleSize={56}
                  itemWidth={56}
                />
              )}
            />
            {errors.color && (
              <Text className="text-error-medium text-sm">
                {errors.color.message}
              </Text>
            )}
          </View>

          {/* Nombre */}
          <View className="gap-2">
            <Text className="text-base text-text-light">Nombre *</Text>
            <FormField
              control={control}
              name="name"
              placeholder="Ej: Alimentación"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botón Crear */}
      <View className="p-4">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={createCategory.isPending}
        >
          Crear categoría
        </Button>
      </View>
    </SafeAreaView>
  );
}
