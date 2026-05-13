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
  CircleSelector,
  DateField,
  FormField,
  Loading,
  SegmentedControl,
  type CircleSelectorItem,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { APP_CONSTANTS } from "@/config";
import { getIconComponent } from "@/shared/utils";
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

function mapCategoriesToItems(categories: Category[]): CircleSelectorItem[] {
  return categories.map((cat) => {
    const Icon = getIconComponent(cat.icon);
    return {
      id: cat.id,
      label: cat.name,
      icon: <Icon size={22} color="#fff" />,
      color: cat.color,
    };
  });
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-col gap-3 p-4">
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

          <View className="flex-col gap-3 items-center py-6">
            <Text className="text-base text-textPrimary">Monto</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-4 items-center justify-center">
                  <Text className="text-5xl font-semibold text-textPrimary">
                    {APP_CONSTANTS.currencySymbol}
                  </Text>
                  <View>
                    <Text className="text-[48px] font-bold text-textPrimary opacity-0">
                      {value !== undefined ? String(value) : "0.00"}
                    </Text>
                    <TextInput
                      className="text-[48px] font-bold text-textPrimary absolute inset-0"
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

          <View className="flex-col gap-2 mb-4">
            <Text className="text-base text-textPrimary">Categoria</Text>
            {categoriesLoading ? (
              <Loading variant="inline" />
            ) : categoriesError ? (
              <Alert variant="error" message={categoriesError.message} />
            ) : (
              <Controller
                control={control}
                name="categoryId"
                render={({ field: { value, onChange } }) => (
                  <CircleSelector
                    items={categoryItems}
                    selectedId={value ?? null}
                    onSelect={onChange}
                    layout="scroll"
                    className="py-2"
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
                      >
                        <View
                          className="rounded-full items-center justify-center border-2 border-dashed border-border bg-surfaceMuted"
                          style={{ width: 56, height: 56 }}
                        >
                          <Plus size={24} color={tokens.brand} />
                        </View>
                        <Text className="text-xs text-center text-textPrimary mt-1">
                          Nueva
                        </Text>
                      </TouchableOpacity>
                    }
                  />
                )}
              />
            )}
            {errors.categoryId && (
              <Text className="text-danger text-sm">
                {errors.categoryId.message}
              </Text>
            )}
          </View>

          <View className="flex-col gap-2">
            <Text className="text-base text-textPrimary">Cuenta</Text>
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

          <View className="flex-col gap-2">
            <Text className="text-base text-textPrimary">Descripcion</Text>
            <FormField
              control={control}
              name="description"
              placeholder="Ej: Almuerzo en restaurante"
            />
          </View>

          <View className="flex-col gap-2">
            <Text className="text-base text-textPrimary">Fecha</Text>
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
      </ScrollView>

      <View className="p-4">
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
