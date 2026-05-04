import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colors } from "@/src/ui/theme/colors";
import { Button, CircleSelector } from "@/src/ui/components/atoms";
import type { CircleSelectorItem } from "@/src/ui/components/atoms";
import { FormField } from "@/src/ui/components/molecules";
import { createCategorySchema } from "@/src/core/schemas/category/create-category.schema";
import { updateCategorySchema } from "@/src/core/schemas/category/update-category.schema";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import { getIconComponent } from "@/src/ui/utils/icon-map";
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  DEFAULT_CATEGORY_ICON,
  DEFAULT_CATEGORY_COLOR,
} from "@/src/core/constants/category.constant";

export type CategoryFormMode = "create" | "edit";

export interface CategoryFormSubmitValues {
  name: string;
  type?: CategoryType;
  icon: string;
  color: string;
}

interface CategoryFormInitialValues {
  name?: string;
  type?: CategoryType;
  icon?: string;
  color?: string;
}

interface CategoryFormProps {
  mode: CategoryFormMode;
  initialValues?: CategoryFormInitialValues;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormSubmitValues) => void;
}

interface InternalFormValues {
  name: string;
  type?: CategoryType;
  icon: string;
  color: string;
}

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

export function CategoryForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: CategoryFormProps) {
  const isCreate = mode === "create";
  const schema = isCreate ? createCategorySchema : updateCategorySchema;
  const submitLabel = isCreate ? "Crear categoría" : "Guardar cambios";
  const initialType = initialValues?.type ?? CategoryType.EXPENSE;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InternalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      type: initialType,
      icon: initialValues?.icon ?? DEFAULT_CATEGORY_ICON,
      color: initialValues?.color ?? DEFAULT_CATEGORY_COLOR,
    },
  });

  const selectedColor = watch("color") ?? DEFAULT_CATEGORY_COLOR;
  const iconItems = buildIconItems(selectedColor);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tipo (siempre read-only) */}
        <View className="gap-2">
          <Text className="text-base text-text-light">Tipo</Text>
          <View className="bg-primary-1 rounded-lg px-4 py-3">
            <Text className="text-base text-primary-7 font-medium">
              {initialType === CategoryType.INCOME ? "Ingreso" : "Gasto"}
            </Text>
          </View>
          {!isCreate && (
            <Text className="text-xs text-subordinary">
              El tipo no se puede cambiar después de crear la categoría
            </Text>
          )}
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
                onSelect={(idx) => onChange(CATEGORY_ICONS[idx])}
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
                onSelect={(idx) => onChange(CATEGORY_COLORS[idx])}
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

      <View className="p-4">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
