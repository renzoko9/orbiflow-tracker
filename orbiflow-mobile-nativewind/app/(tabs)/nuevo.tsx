import { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import {
  Input,
  Button,
  SegmentedControl,
  CircleSelector,
  Alert,
} from "@/src/ui/components/atoms";
import { FormField } from "@/src/ui/components/molecules";
import { useCategories } from "@/src/ui/hooks";
import { CategoryType } from "@/src/core/enums/category-type.enum";
import {
  createTransactionSchema,
  CreateTransactionFormValues,
} from "@/src/core/schemas/transaction/create-transaction.schema";
import { CircleSelectorItem } from "@/src/ui/components/atoms/CircleSelector";
import { Category } from "@/src/core/dto/category.interface";
import TransactionService from "@/src/core/services/transaction.service";

const CATEGORY_COLORS = [
  colors.error.medium,
  colors.warning.medium,
  colors.brand,
  colors.accent,
  colors.secondary.second.medium,
  colors.primary[5],
  colors.success.medium,
  colors.secondary.first.medium,
  colors.secondary.third.medium,
];

function mapCategoriesToItems(categories: Category[]): CircleSelectorItem[] {
  return categories.map((cat, index) => ({
    id: cat.id,
    label: cat.name,
    icon: null,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));
}

export default function NuevoScreen() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: CategoryType.EXPENSE,
      date: new Date().toISOString(),
      amount: undefined,
      accountId: undefined,
      categoryId: undefined,
      description: "",
    },
  });

  const type = watch("type");
  const isExpense = type === CategoryType.EXPENSE;

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories({ type });

  const categoryItems = mapCategoriesToItems(categories);

  useEffect(() => {
    setValue("categoryId", undefined);
  }, [type, setValue]);

  const onSubmit = async (data: CreateTransactionFormValues) => {
    try {
      await TransactionService.create({
        amount: data.amount,
        type: data.type,
        date: data.date,
        accountId: data.accountId,
        categoryId: data.categoryId,
        description: data.description,
      });
      reset();
      router.back();
    } catch (error) {
      console.error("Error al crear transacción:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-col gap-3 p-4">
          {/* Header con nav */}
          <View className="flex-row gap-2 items-center my-3">
            <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
              <ArrowLeft size={24} color={colors.base} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-base-color flex-1 text-center">
              Nuevo Movimiento
            </Text>
          </View>

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
          <View className="flex-col gap-1 items-center py-6">
            <Text className="text-base">Monto</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-1 items-center">
                  <Text className="text-5xl font-semibold text-base-color">
                    S/
                  </Text>
                  <TextInput
                    className="text-5xl font-bold text-base-color text-center w-40"
                    placeholder="0.00"
                    placeholderTextColor={colors.disabled}
                    value={value !== undefined ? String(value) : ""}
                    onChangeText={(text) => {
                      const parsed = parseFloat(text);
                      onChange(isNaN(parsed) ? undefined : parsed);
                    }}
                    keyboardType="decimal-pad"
                  />
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
          <View className="flex-col gap-4 mb-4">
            <Text className="text-base text-text-light">Categoría</Text>
            {categoriesLoading ? (
              <ActivityIndicator color={colors.primary[5]} />
            ) : categoriesError ? (
              <Alert variant="error" message={categoriesError} />
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

          {/* Botón Guardar */}
          <Button
            variant="primary"
            size="lg"
            className={isExpense ? "bg-error-medium" : "bg-success-medium"}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Guardar {isExpense ? "Gasto" : "Ingreso"}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
