import { useEffect, useState } from "react";
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
import { getCurrency } from "@/shared/i18n";
import { useAuthStore } from "@/shared/auth";
import { useAccounts, type Account } from "@/features/accounts";
import {
  TransactionType,
  useCategories,
  type Category,
} from "@/features/categories";
import {
  transactionFormSchema,
  type LocalPhoto,
  type TransactionFormValues,
} from "../model";
import { AccountSelectField } from "./AccountSelectField";
import { PhotosField } from "./PhotosField";

export type TransactionFormMode = "create" | "edit";

export type TransactionFormKind = "movement" | "transfer";

export type TransactionFormSubmitValues =
  | {
      kind: "movement";
      amount: number;
      description?: string;
      type: TransactionType;
      date: string;
      categoryId?: number;
      accountId: number;
      existingPhotos: string[];
      newPhotos: LocalPhoto[];
      photosTouched: boolean;
    }
  | {
      kind: "transfer";
      amount: number;
      description?: string;
      date: string;
      sourceAccountId: number;
      destinationAccountId: number;
    };

interface TransactionFormInitialValues {
  kind?: TransactionFormKind;
  amount?: number;
  description?: string;
  type?: TransactionType;
  date?: string;
  categoryId?: number;
  accountId?: number;
  sourceAccountId?: number;
  destinationAccountId?: number;
  photos?: string[];
}

interface TransactionFormProps {
  mode: TransactionFormMode;
  initialValues?: TransactionFormInitialValues;
  isSubmitting: boolean;
  onSubmit: (data: TransactionFormSubmitValues) => void;
  onPressPhoto?: (uri: string) => void;
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
  onPressPhoto,
}: TransactionFormProps) {
  const router = useRouter();
  const tokens = useThemeTokens();
  const currencySymbol = getCurrency(
    useAuthStore((s) => s.user?.currency),
  ).symbol;
  const isCreate = mode === "create";

  const initialKind: TransactionFormKind = initialValues?.kind ?? "movement";

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      kind: initialKind,
      type: initialValues?.type ?? TransactionType.EXPENSE,
      date: initialValues?.date ?? new Date().toISOString(),
      amount: initialValues?.amount as number,
      accountId: initialValues?.accountId,
      categoryId: initialValues?.categoryId,
      description: initialValues?.description ?? undefined,
      sourceAccountId: initialValues?.sourceAccountId,
      destinationAccountId: initialValues?.destinationAccountId,
    },
  });

  const kind = watch("kind");
  const type = watch("type");
  const isMovement = kind === "movement";

  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    initialValues?.photos ?? [],
  );
  const [newPhotos, setNewPhotos] = useState<LocalPhoto[]>([]);
  const [photosTouched, setPhotosTouched] = useState(false);

  const handleRemoveExisting = (url: string) => {
    setExistingPhotos((prev) => prev.filter((u) => u !== url));
    setPhotosTouched(true);
  };
  const handleRemoveNew = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotosTouched(true);
  };
  const handleAddNew = (photo: LocalPhoto) => {
    setNewPhotos((prev) => [...prev, photo]);
    setPhotosTouched(true);
  };

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories({ type: isMovement ? type : undefined });

  const {
    data: accounts = [],
    isLoading: accountsLoading,
    error: accountsError,
  } = useAccounts();

  const activeAccounts = accounts.filter((a: Account) => a.archivedAt === null);

  useEffect(() => {
    if (!isCreate) return;
    if (!isMovement) return;
    setValue("categoryId", undefined);
  }, [type, kind, setValue, isCreate, isMovement]);

  const categoryItems = mapCategoriesToItems(categories);

  const submitHandler = handleSubmit((data) => {
    if (data.kind === "movement") {
      onSubmit({
        kind: "movement",
        amount: data.amount,
        description: data.description,
        type: data.type as TransactionType,
        date: data.date,
        categoryId: data.categoryId,
        accountId: data.accountId as number,
        existingPhotos,
        newPhotos,
        photosTouched,
      });
      return;
    }
    onSubmit({
      kind: "transfer",
      amount: data.amount,
      description: data.description,
      date: data.date,
      sourceAccountId: data.sourceAccountId as number,
      destinationAccountId: data.destinationAccountId as number,
    });
  });

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
        {isCreate ? (
          <View className="px-5 pt-2">
            <Controller
              control={control}
              name="kind"
              render={({ field: { value, onChange } }) => (
                <SegmentedControl
                  options={[
                    { value: "movement-expense", label: "Gasto" },
                    { value: "movement-income", label: "Ingreso" },
                    { value: "transfer", label: "Transferencia" },
                  ]}
                  value={
                    value === "transfer"
                      ? "transfer"
                      : type === TransactionType.INCOME
                        ? "movement-income"
                        : "movement-expense"
                  }
                  onChange={(v) => {
                    if (v === "transfer") {
                      onChange("transfer");
                      return;
                    }
                    onChange("movement");
                    setValue(
                      "type",
                      v === "movement-income"
                        ? TransactionType.INCOME
                        : TransactionType.EXPENSE,
                    );
                  }}
                />
              )}
            />
          </View>
        ) : null}

        <View className="flex-col gap-3 items-center py-6">
          <Text className="text-[16px] font-display-semibold uppercase text-textPrimary">
            Monto
          </Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <View className="flex-row gap-4 items-center justify-center">
                <Text className="text-[40px] font-display-bold text-textPrimary">
                  {currencySymbol}
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

        {isMovement ? (
          <>
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
                            <Plus
                              size={22}
                              color={tokens.brand}
                              strokeWidth={2.5}
                            />
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
          </>
        ) : (
          <>
            <View className="px-5 pt-6">
              <SectionEyebrow label="De" />
              {accountsLoading ? (
                <Loading variant="inline" />
              ) : accountsError ? (
                <Alert variant="error" message={accountsError.message} />
              ) : (
                <Controller
                  control={control}
                  name="sourceAccountId"
                  render={({ field: { value, onChange } }) => (
                    <AccountSelectField
                      accounts={activeAccounts}
                      selectedId={value ?? null}
                      onSelect={onChange}
                      error={errors.sourceAccountId?.message}
                    />
                  )}
                />
              )}
            </View>

            <View className="h-px bg-border mx-5 mt-6" />

            <View className="px-5 pt-6">
              <SectionEyebrow label="A" />
              {accountsLoading ? (
                <Loading variant="inline" />
              ) : accountsError ? (
                <Alert variant="error" message={accountsError.message} />
              ) : (
                <Controller
                  control={control}
                  name="destinationAccountId"
                  render={({ field: { value, onChange } }) => (
                    <AccountSelectField
                      accounts={activeAccounts}
                      selectedId={value ?? null}
                      onSelect={onChange}
                      error={errors.destinationAccountId?.message}
                    />
                  )}
                />
              )}
            </View>
          </>
        )}

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
                placeholder={
                  isMovement
                    ? "Ej. Almuerzo en restaurante"
                    : "Ej. Para ahorro mensual"
                }
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

        {isMovement && (
          <>
            <View className="h-px bg-border mx-5 mt-6" />
            <View className="px-5 pt-6">
              <SectionEyebrow label="Adjuntos" />
              <PhotosField
                existingPhotos={existingPhotos}
                newPhotos={newPhotos}
                onRemoveExisting={handleRemoveExisting}
                onRemoveNew={handleRemoveNew}
                onAddNew={handleAddNew}
                onPressPhoto={onPressPhoto}
                disabled={isSubmitting}
              />
            </View>
          </>
        )}
      </ScrollView>

      <View className="px-5 pt-4 pb-6 border-t border-border bg-background">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={submitHandler}
          loading={isSubmitting}
        >
          {isCreate
            ? isMovement
              ? "Guardar movimiento"
              : "Guardar transferencia"
            : "Guardar cambios"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
