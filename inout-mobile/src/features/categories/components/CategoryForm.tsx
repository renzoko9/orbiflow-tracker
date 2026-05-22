import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  IconSelector,
  FormField,
  type IconSelectorItem,
} from "@/shared/ui";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  TransactionType,
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  updateCategorySchema,
  type UpdateCategoryFormValues,
} from "../model";

export type CategoryFormMode = "create" | "edit";

export interface CategoryFormSubmitValues {
  name: string;
  icon: string;
  color: string;
}

interface CategoryFormInitialValues {
  name?: string;
  type?: TransactionType;
  icon?: string;
  color?: string;
}

interface CategoryFormProps {
  mode: CategoryFormMode;
  initialValues?: CategoryFormInitialValues;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormSubmitValues) => void;
}

/**
 * El tipo (Ingreso/Gasto) se muestra read-only y se gestiona fuera del form.
 * Asi ambos modos (create/edit) comparten exactamente el mismo schema.
 */
type InternalFormValues = UpdateCategoryFormValues;

function buildIconItems(selectedColor: string): IconSelectorItem[] {
  return CATEGORY_ICONS.map((iconName, index) => ({
    id: index,
    label: "",
    iconName,
    color: selectedColor,
  }));
}

const colorItems: IconSelectorItem[] = CATEGORY_COLORS.map((c, index) => ({
  id: index,
  label: "",
  color: c,
}));

export function CategoryForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: CategoryFormProps) {
  const isCreate = mode === "create";
  const submitLabel = isCreate ? "Crear categoria" : "Guardar cambios";
  const initialType = initialValues?.type ?? TransactionType.EXPENSE;

  const { control, handleSubmit, watch } = useForm<InternalFormValues>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
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
        <View className="gap-2">
          <Text className="text-base text-textPrimary">Tipo</Text>
          <View className="bg-brandSoft rounded-lg px-4 py-3">
            <Text className="text-base text-brand font-medium">
              {initialType === TransactionType.INCOME ? "Ingreso" : "Gasto"}
            </Text>
          </View>
          {!isCreate && (
            <Text className="text-xs text-textSecondary">
              El tipo no se puede cambiar despues de crear la categoria
            </Text>
          )}
        </View>

        <View className="gap-2">
          <Text className="text-base text-textPrimary">Icono</Text>
          <Controller
            control={control}
            name="icon"
            render={({ field: { value, onChange } }) => (
              <IconSelector
                items={iconItems}
                selectedId={CATEGORY_ICONS.indexOf(
                  (value ??
                    DEFAULT_CATEGORY_ICON) as (typeof CATEGORY_ICONS)[number],
                )}
                onSelect={(idx) => onChange(CATEGORY_ICONS[idx])}
                layout="scroll"
                tileSize={56}
                itemWidth={56}
              />
            )}
          />
        </View>

        <View className="gap-2">
          <Text className="text-base text-textPrimary">Color</Text>
          <Controller
            control={control}
            name="color"
            render={({ field: { value, onChange } }) => (
              <IconSelector
                items={colorItems}
                selectedId={CATEGORY_COLORS.indexOf(
                  (value ??
                    DEFAULT_CATEGORY_COLOR) as (typeof CATEGORY_COLORS)[number],
                )}
                onSelect={(idx) => onChange(CATEGORY_COLORS[idx])}
                layout="scroll"
                tileSize={56}
                itemWidth={56}
              />
            )}
          />
        </View>

        <View className="gap-2">
          <Text className="text-base text-textPrimary">Nombre *</Text>
          <FormField
            control={control}
            name="name"
            placeholder="Ej: Alimentacion"
          />
        </View>
      </ScrollView>

      <View className="p-4">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
        >
          {submitLabel}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
