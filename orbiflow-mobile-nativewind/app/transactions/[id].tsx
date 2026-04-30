import { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { Plus } from "lucide-react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { colors } from "@/src/ui/theme/colors";
import {
  Button,
  SegmentedControl,
  CircleSelector,
  Alert,
  showToast,
} from "@/src/ui/components/atoms";
import {
  FormField,
  DateSelectField,
  AccountSelectField,
  ScreenHeader,
} from "@/src/ui/components/molecules";
import {
  useTransaction,
  useCategories,
  useAccounts,
  useUpdateTransaction,
} from "@/src/ui/hooks";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import {
  updateTransactionSchema,
  UpdateTransactionFormValues,
} from "@/src/core/schemas/transaction/update-transaction.schema";
import { CircleSelectorItem } from "@/src/ui/components/atoms/CircleSelector";
import { Category } from "@/src/core/dto/category.interface";
import { ApiError } from "@/src/core/api/api-error";
import { getIconComponent } from "@/src/ui/utils/icon-map";

function mapCategoriesToItems(categories: Category[]): CircleSelectorItem[] {
  return categories.map((cat) => {
    const IconComponent = getIconComponent(cat.icon);
    return {
      id: cat.id,
      label: cat.name,
      icon: <IconComponent size={22} color={colors.inverse} />,
      color: cat.color,
    };
  });
}

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);

  const { data: transaction, isLoading, error } = useTransaction(transactionId);
  const updateTransaction = useUpdateTransaction(transactionId);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateTransactionFormValues>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      type: CategoryType.EXPENSE,
      date: new Date().toISOString(),
      amount: undefined,
      accountId: undefined,
      categoryId: undefined,
      description: undefined,
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

  const categoryItems = mapCategoriesToItems(categories);

  // Precargar el formulario cuando llega la data
  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
        accountId: transaction.account.id,
        categoryId: transaction.category?.id ?? undefined,
        description: transaction.description,
      });
    }
  }, [transaction, reset]);

  const onSubmit = (data: UpdateTransactionFormValues) => {
    console.log(data)
    updateTransaction.mutate(
      {
        amount: data.amount,
        type: data.type,
        date: data.date,
        accountId: data.accountId,
        categoryId: data.categoryId,
        description: data.description,
      },
      {
        onSuccess: (response) => {
          showToast({
            type: "success",
            text1: response.title ?? "Transacción actualizada",
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Detalle" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[5]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Detalle" />
        <View className="px-4 pt-4">
          <Alert
            variant="error"
            message={error?.message ?? "No se encontró la transacción"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Editar Movimiento" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-col gap-3 p-4">
            {/* Switch Gasto / Ingreso */}
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <SegmentedControl
                  options={[
                    { value: CategoryType.EXPENSE, label: "Gasto" },
                    { value: CategoryType.INCOME, label: "Ingreso" },
                  ]}
                  value={value}
                  onChange={onChange}
                  className="border border-primary-2"
                />
              )}
            />

            {/* Monto */}
            <View className="flex-col gap-3 items-center py-6">
              <Text className="text-base">Monto</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <View className="flex-row gap-4 items-center justify-center">
                    <Text className="text-5xl font-semibold text-base-color">
                      S/
                    </Text>
                    <View>
                      <Text className="text-[48px] font-bold text-base-color opacity-0">
                        {value !== undefined ? String(value) : "0.00"}
                      </Text>
                      <TextInput
                        className="text-[48px] font-bold text-base-color absolute inset-0"
                        placeholder="0.00"
                        placeholderTextColor={colors.disabled}
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
                <Text className="text-error-medium text-sm mt-1">
                  {errors.amount.message}
                </Text>
              )}
            </View>

            {/* Categorías */}
            <View className="flex-col gap-2 mb-4">
              <Text className="text-base text-text-light">Categoría</Text>
              {categoriesLoading ? (
                <ActivityIndicator color={colors.primary[5]} />
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
                            className="rounded-full items-center justify-center border-2 border-dashed border-primary-3"
                            style={{ width: 56, height: 56 }}
                          >
                            <Plus size={24} color={colors.primary[5]} />
                          </View>
                          <Text className="text-xs text-center text-text-light mt-1">
                            Nueva
                          </Text>
                        </TouchableOpacity>
                      }
                    />
                  )}
                />
              )}
              {errors.categoryId && (
                <Text className="text-error-medium text-sm">
                  {errors.categoryId.message}
                </Text>
              )}
            </View>

            {/* Cuenta */}
            <View className="flex-col gap-2">
              <Text className="text-base text-text-light">Cuenta</Text>
              {accountsLoading ? (
                <ActivityIndicator color={colors.primary[5]} />
              ) : accountsError ? (
                <Alert variant="error" message={accountsError.message} />
              ) : (
                <Controller
                  control={control}
                  name="accountId"
                  render={({ field: { value, onChange } }) => (
                    <AccountSelectField
                      accounts={accounts}
                      selectedId={value ?? null}
                      onSelect={onChange}
                      error={errors.accountId?.message}
                    />
                  )}
                />
              )}
            </View>

            {/* Descripción */}
            <View className="flex-col gap-2">
              <Text className="text-base text-text-light">Descripción</Text>
              <FormField
                control={control}
                name="description"
                placeholder="Ej: Almuerzo en restaurante"
              />
            </View>

            {/* Fecha */}
            <View className="flex-col gap-2">
              <Text className="text-base text-text-light">Fecha</Text>
              <Controller
                control={control}
                name="date"
                render={({ field: { value, onChange } }) => (
                  <DateSelectField
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
      </KeyboardAvoidingView>

      {/* Botón Guardar */}
      <View className="p-4">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={updateTransaction.isPending}
        >
          Guardar cambios
        </Button>
      </View>
    </SafeAreaView>
  );
}
