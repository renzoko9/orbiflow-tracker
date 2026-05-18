import { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react-native";
import {
  Alert,
  Button,
  IconSelector,
  DateField,
  FormField,
  Loading,
  SectionEyebrow,
  SegmentedControl,
  type IconSelectorItem,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { APP_CONSTANTS } from "@/config";
import { useAccounts, type Account } from "@/features/accounts";
import {
  CategoryType,
  useCategories,
  type Category,
} from "@/features/categories";
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from "../model";
import { AccountSelectField } from "./AccountSelectField";

export type TransactionFormMode = "create" | "edit";

export interface TransactionFormSubmitValues {
  amount: number;
  description?: string;
  type: CategoryType;
  date: string;
  categoryId?: number;
  accountId: number;
}

interface TransactionFormInitialValues {
  amount?: number;
  description?: string;
  type?: CategoryType;
  date?: string;
  categoryId?: number;
  accountId?: number;
}

interface TransactionFormProps {
  mode: TransactionFormMode;
  initialValues?: TransactionFormInitialValues;
  isSubmitting: boolean;
  onSubmit: (data: TransactionFormSubmitValues) => void;
}

function mapCategoriesToItems(categories: Category[]): IconSelectorItem[] {
  return categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    iconName: cat.icon,
    color: cat.color,
  }));
}

export function TransactionForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: TransactionFormProps) {
  const router = useRouter();
  const tokens = useThemeTokens();
  const isCreate = mode === "create";

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: initialValues?.type ?? CategoryType.EXPENSE,
      date: initialValues?.date ?? new Date().toISOString(),
      amount: initialValues?.amount as number,
      accountId: initialValues?.accountId as number,
      categoryId: initialValues?.categoryId,
      description: initialValues?.description ?? undefined,
    },
  });

  const type = watch("type");

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories({ type });

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    error: accountsError,
  } = useAccounts();

  const activeAccounts = accounts.filter((a: Account) => a.archivedAt === null);

  // Limpiar categoria al cambiar tipo (create) o al cargar (si no aplica al tipo)
  useEffect(() => {
    if (!isCreate) return;
    setValue("categoryId", undefined);
  }, [type, setValue, isCreate]);

  const categoryItems = mapCategoriesToItems(categories);

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
        <View className="px-5 pt-2">
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <SegmentedControl
                options={[
                  { value: String(CategoryType.EXPENSE), label: "Gasto" },
                  { value: String(CategoryType.INCOME), label: "Ingreso" },
                ]}
                value={String(value)}
                onChange={(v) => onChange(Number(v) as CategoryType)}
              />
            )}
          />
        </View>

        <View className="flex-col gap-3 items-center py-6">
          <Text className="text-[16px] font-display-semibold uppercase text-textPrimary">Monto</Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-4 items-center justify-center">
                <Text className="text-[40px] font-display-bold text-textPrimary">
                  {APP_CONSTANTS.currencySymbol}
                </Text>
                <View>
                  <Text className="text-[48px] font-sans-bold text-textPrimary opacity-0">
                    {value !== undefined ? String(value) : "0.00"}
                  </Text>
                  <TextInput
                    className="text-[48px] font-display-bold text-textPrimary absolute inset-0"
                    placeholder="0.00"
                    placeholderTextColor={tokens.textDisabled}
                    value={value !== undefined ? String(value) : ""}
                    onChangeText={(text) => {
                      if (text === "" || text === ".") {
                        onChange(undefined);
                        return;
                      }
                      if (/^\d*\.?\d*$/.test(text)) {
                        onChange(
                          text.endsWith(".") ? text : parseFloat(text),
                        );
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}
          />
          {errors.amount && (
            <Text className="text-danger text-sm mt-1">
              {errors.amount.message}
            </Text>
          )}
        </View>

        <View className="h-px bg-border mx-5" />

        <View className="px-5 pt-6">
          <SectionEyebrow label="Categoria" />
          {categoriesLoading ? (
            <Loading variant="inline" />
          ) : categoriesError ? (
            <Alert variant="error" message={categoriesError.message} />
          ) : (
            <Controller
              control={control}
              name="categoryId"
              render={({ field: { value, onChange } }) => (
                <IconSelector
                  items={categoryItems}
                  selectedId={value ?? null}
                  onSelect={onChange}
                  layout="scroll"
                  trailingAction={
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/categories/create",
                          params: { type: String(type) },
                        })
                      }
                      className="items-center"
                      style={{ width: 72 }}
                      activeOpacity={0.7}
                    >
                      <View className="w-16 h-16 rounded-xl items-center justify-center border border-dashed border-borderStrong bg-surfaceMuted mb-1">
                        <Plus size={22} color={tokens.brand} strokeWidth={2.5} />
                      </View>
                      <Text className="text-xs text-center font-sans-semibold text-brand">
                        Nueva
                      </Text>
                    </TouchableOpacity>
                  }
                />
              )}
            />
          )}
          {errors.categoryId ? (
            <Text className="text-xs text-danger mt-2">
              {errors.categoryId.message}
            </Text>
          ) : null}
        </View>

        <View className="h-px bg-border mx-5 mt-6" />

        <View className="px-5 pt-6">
          <SectionEyebrow label="Cuenta" />
          {accountsLoading ? (
            <Loading variant="inline" />
          ) : accountsError ? (
            <Alert variant="error" message={accountsError.message} />
          ) : (
            <Controller
              control={control}
              name="accountId"
              render={({ field: { value, onChange } }) => (
                <AccountSelectField
                  accounts={activeAccounts}
                  selectedId={value ?? null}
                  onSelect={onChange}
                  error={errors.accountId?.message}
                />
              )}
            />
          )}
        </View>

        <View className="h-px bg-border mx-5 mt-6" />

        <View className="px-5 pt-6">
          <SectionEyebrow label="Detalles" />

          <View className="gap-4">
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
                placeholder="Ej. Almuerzo en restaurante"
              />
            </View>

            <View>
              <Text
                className="text-[10px] font-sans-bold uppercase text-textTertiary mb-2"
                style={{ letterSpacing: 0.6 }}
              >
                Fecha
              </Text>
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <DateField
                    value={value}
                    onChange={onChange}
                    error={errors.date?.message}
                    maximumDate={new Date()}
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
          fullWidth
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        >
          {isCreate ? "Guardar movimiento" : "Guardar cambios"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
