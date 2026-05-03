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
import { createAccountSchema } from "@/src/core/schemas/account/create-account.schema";
import { updateAccountSchema } from "@/src/core/schemas/account/update-account.schema";
import { getIconComponent } from "@/src/ui/utils/icon-map";
import {
  ACCOUNT_ICONS,
  ACCOUNT_COLORS,
  DEFAULT_ACCOUNT_ICON,
  DEFAULT_ACCOUNT_COLOR,
} from "@/src/core/constants/account.constant";

export type AccountFormMode = "create" | "edit";

export interface AccountFormSubmitValues {
  name: string;
  balance?: number;
  description?: string;
  icon?: string;
  color?: string;
}

interface AccountFormInitialValues {
  name?: string;
  balance?: string;
  description?: string | null;
  icon?: string;
  color?: string;
}

interface AccountFormProps {
  mode: AccountFormMode;
  initialValues?: AccountFormInitialValues;
  isSubmitting: boolean;
  onSubmit: (data: AccountFormSubmitValues) => void;
}

interface InternalFormValues {
  name: string;
  balance?: number;
  description?: string;
  icon?: string;
  color?: string;
}

function buildIconItems(selectedColor: string): CircleSelectorItem[] {
  return ACCOUNT_ICONS.map((iconName, index) => {
    const IconComp = getIconComponent(iconName);
    return {
      id: index,
      label: "",
      icon: <IconComp size={22} color={colors.inverse} />,
      color: selectedColor,
    };
  });
}

const colorItems: CircleSelectorItem[] = ACCOUNT_COLORS.map((c, index) => ({
  id: index,
  label: "",
  icon: null,
  color: c,
}));

export function AccountForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: AccountFormProps) {
  const isCreate = mode === "create";
  const schema = isCreate ? createAccountSchema : updateAccountSchema;
  const submitLabel = isCreate ? "Crear cuenta" : "Guardar cambios";

  const { control, handleSubmit, watch } = useForm<InternalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValues?.name ?? "",
      balance: undefined,
      description: initialValues?.description ?? undefined,
      icon: initialValues?.icon ?? DEFAULT_ACCOUNT_ICON,
      color: initialValues?.color ?? DEFAULT_ACCOUNT_COLOR,
    },
  });

  const selectedColor = watch("color") ?? DEFAULT_ACCOUNT_COLOR;
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
        {/* Icono */}
        <View className="gap-2">
          <Text className="text-base text-text-light">Icono</Text>
          <Controller
            control={control}
            name="icon"
            render={({ field: { value, onChange } }) => (
              <CircleSelector
                items={iconItems}
                selectedId={ACCOUNT_ICONS.indexOf(
                  (value ??
                    DEFAULT_ACCOUNT_ICON) as (typeof ACCOUNT_ICONS)[number],
                )}
                onSelect={(idx) => onChange(ACCOUNT_ICONS[idx])}
                layout="scroll"
                circleSize={56}
                itemWidth={56}
              />
            )}
          />
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
                selectedId={ACCOUNT_COLORS.indexOf(
                  (value ??
                    DEFAULT_ACCOUNT_COLOR) as (typeof ACCOUNT_COLORS)[number],
                )}
                onSelect={(idx) => onChange(ACCOUNT_COLORS[idx])}
                layout="scroll"
                circleSize={56}
                itemWidth={56}
              />
            )}
          />
        </View>

        {/* Nombre */}
        <View className="gap-2">
          <Text className="text-base text-text-light">Nombre *</Text>
          <FormField
            control={control}
            name="name"
            placeholder="Ej: Cuenta corriente"
          />
        </View>

        {/* Balance */}
        <View className="gap-2">
          <Text className="text-base text-text-light">
            {isCreate ? "Balance inicial" : "Balance"}
          </Text>
          {isCreate ? (
            <FormField
              control={control}
              name="balance"
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          ) : (
            <>
              <View className="rounded-xl bg-primary-1 px-4 py-3">
                <Text className="text-base text-text-light">
                  S/ {Number(initialValues?.balance ?? 0).toFixed(2)}
                </Text>
              </View>
              <Text className="text-xs text-subordinary">
                El balance se ajusta registrando movimientos
              </Text>
            </>
          )}
        </View>

        {/* Descripción */}
        <View className="gap-2">
          <Text className="text-base text-text-light">Descripción</Text>
          <FormField
            control={control}
            name="description"
            placeholder="Ej: Cuenta para gastos diarios"
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
