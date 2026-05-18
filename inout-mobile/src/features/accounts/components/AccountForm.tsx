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
  SectionEyebrow,
  type IconSelectorItem,
} from "@/shared/ui";
import { formatCurrency } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";
import {
  ACCOUNT_COLORS,
  ACCOUNT_ICONS,
  DEFAULT_ACCOUNT_COLOR,
  DEFAULT_ACCOUNT_ICON,
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountFormValues,
  type UpdateAccountFormValues,
} from "../model";

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

type InternalFormValues = CreateAccountFormValues & UpdateAccountFormValues;

const tabular = { fontVariant: ["tabular-nums" as const] };

function buildIconItems(selectedColor: string): IconSelectorItem[] {
  return ACCOUNT_ICONS.map((iconName, index) => ({
    id: index,
    label: "",
    iconName,
    color: selectedColor,
  }));
}

const colorItems: IconSelectorItem[] = ACCOUNT_COLORS.map((c, index) => ({
  id: index,
  label: "",
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
  const selectedIcon = watch("icon") ?? DEFAULT_ACCOUNT_ICON;
  const previewName = (watch("name") ?? "").trim();
  const previewDescription = (watch("description") ?? "").trim();
  const previewBalanceRaw = isCreate
    ? watch("balance")
    : initialValues?.balance;
  const previewBalance = Number(previewBalanceRaw ?? 0) || 0;

  const PreviewIcon = getIconComponent(selectedIcon);
  const iconItems = buildIconItems(selectedColor);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-5 pt-2 pb-6 flex-row items-center">
          <View className="flex-1 mr-4">
            <Text
              className="text-[10px] font-sans-bold uppercase text-textTertiary mb-2"
              style={{ letterSpacing: 1.2 }}
            >
              Vista previa
            </Text>

            <Text
              className={`text-3xl font-sans-extrabold ${previewName ? "text-textPrimary" : "text-textDisabled"}`}
              numberOfLines={1}
            >
              {previewName || "Tu cuenta nueva"}
            </Text>

            <Text
              className="text-[44px] font-display-bold text-textPrimary mt-3"
              style={[{ lineHeight: 56, includeFontPadding: false }, tabular]}
            >
              {formatCurrency(previewBalance)}
            </Text>

            {previewDescription ? (
              <Text
                className="text-base font-sans-medium text-textSecondary mt-2"
                numberOfLines={2}
              >
                {previewDescription}
              </Text>
            ) : null}
          </View>

          <View
            className="w-20 h-20 rounded-2xl items-center justify-center"
            style={{ backgroundColor: selectedColor + "1F" }}
          >
            <PreviewIcon size={40} color={selectedColor} />
          </View>
        </View>

        <View className="h-px bg-border mx-5" />

        <View className="px-5 pt-6">
          <SectionEyebrow label="Identidad" />

          <View className="gap-4">
            <View>
              <Text
                className="text-[10px] font-sans-bold uppercase text-textTertiary mb-2"
                style={{ letterSpacing: 0.6 }}
              >
                Nombre
              </Text>
              <FormField
                control={control}
                name="name"
                placeholder="Ej. Cuenta corriente"
              />
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <Text
                  className="text-[10px] font-sans-bold uppercase text-textTertiary"
                  style={{ letterSpacing: 0.6 }}
                >
                  Descripcion
                </Text>
                <Text
                  className="text-[10px] font-sans-bold uppercase text-textDisabled ml-2"
                  style={{ letterSpacing: 0.6 }}
                >
                  · Opcional
                </Text>
              </View>
              <FormField
                control={control}
                name="description"
                placeholder="Para distinguirla en listas"
              />
            </View>
          </View>
        </View>

        <View className="h-px bg-border mx-5 mt-6" />

        {isCreate ? (
          <View className="px-5 pt-6">
            <SectionEyebrow label="Saldo inicial" />
            <FormField
              control={control}
              name="balance"
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
            <Text className="text-xs text-textTertiary mt-2">
              Lo que tenes hoy en esta cuenta. Si la dejas vacia, arranca en 0.
            </Text>
          </View>
        ) : (
          <View className="px-5 pt-6">
            <SectionEyebrow label="Saldo actual" />
            <Text
              className="text-[28px] font-display-bold text-textPrimary"
              style={[{ includeFontPadding: false }, tabular]}
            >
              {formatCurrency(initialValues?.balance ?? 0)}
            </Text>
            <Text className="text-xs text-textTertiary mt-2">
              El saldo se ajusta registrando movimientos.
            </Text>
          </View>
        )}

        <View className="h-px bg-border mx-5 mt-6" />

        <View className="px-5 pt-6">
          <SectionEyebrow label="Apariencia" />

          <View className="gap-5">
            <View>
              <Text
                className="text-[10px] font-sans-bold uppercase text-textTertiary mb-3"
                style={{ letterSpacing: 0.6 }}
              >
                Color
              </Text>
              <Controller
                control={control}
                name="color"
                render={({ field: { value, onChange } }) => (
                  <IconSelector
                    items={colorItems}
                    selectedId={ACCOUNT_COLORS.indexOf(
                      (value ??
                        DEFAULT_ACCOUNT_COLOR) as (typeof ACCOUNT_COLORS)[number],
                    )}
                    onSelect={(idx) => onChange(ACCOUNT_COLORS[idx])}
                    layout="scroll"
                    tileSize={48}
                    itemWidth={48}
                  />
                )}
              />
            </View>

            <View>
              <Text
                className="text-[10px] font-sans-bold uppercase text-textTertiary mb-3"
                style={{ letterSpacing: 0.6 }}
              >
                Icono
              </Text>
              <Controller
                control={control}
                name="icon"
                render={({ field: { value, onChange } }) => (
                  <IconSelector
                    items={iconItems}
                    selectedId={ACCOUNT_ICONS.indexOf(
                      (value ??
                        DEFAULT_ACCOUNT_ICON) as (typeof ACCOUNT_ICONS)[number],
                    )}
                    onSelect={(idx) => onChange(ACCOUNT_ICONS[idx])}
                    layout="scroll"
                    tileSize={48}
                    itemWidth={48}
                  />
                )}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pt-4 pb-6 border-t border-border bg-background">
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
