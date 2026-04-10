import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Button, showToast, CircleSelector } from "@/src/ui/components/atoms";
import type { CircleSelectorItem } from "@/src/ui/components/atoms";
import { FormField } from "@/src/ui/components/molecules";
import {
  createAccountSchema,
  CreateAccountFormValues,
} from "@/src/core/schemas/account/create-account.schema";
import AccountService from "@/src/core/services/account.service";
import { ApiError } from "@/src/core/api/api-error";
import { getIconComponent } from "@/src/ui/utils/icon-map";
import {
  ACCOUNT_ICONS,
  ACCOUNT_COLORS,
  DEFAULT_ACCOUNT_ICON,
  DEFAULT_ACCOUNT_COLOR,
} from "@/src/core/constants/account.constant";

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

export default function CreateAccountScreen() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: "",
      balance: undefined,
      description: undefined,
      icon: DEFAULT_ACCOUNT_ICON,
      color: DEFAULT_ACCOUNT_COLOR,
    },
  });

  const selectedColor = watch("color") ?? DEFAULT_ACCOUNT_COLOR;
  const iconItems = buildIconItems(selectedColor);

  const onSubmit = async (data: CreateAccountFormValues) => {
    try {
      await AccountService.create({
        name: data.name,
        balance: data.balance,
        description: data.description,
        icon: data.icon,
        color: data.color,
      });
      showToast({
        type: "success",
        text1: "Cuenta creada",
        text2: "La cuenta se registró correctamente",
      });
      router.back();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Ocurrió un error inesperado";
      showToast({
        type: "error",
        text1: "Error",
        text2: message,
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.base} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-base-color flex-1 text-center">
          Nueva Cuenta
        </Text>
        <View className="w-6" />
      </View>

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
                onSelect={(id) => onChange(ACCOUNT_ICONS[id])}
                layout="scroll"
                circleSize={48}
                itemWidth={48}
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
              <View className="flex-row gap-3 flex-wrap">
                {ACCOUNT_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => onChange(c)}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      value === c ? "border-2 border-primary-5" : ""
                    }`}
                    style={{
                      backgroundColor: c,
                      opacity: value === c ? 1 : 0.5,
                    }}
                  />
                ))}
              </View>
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

        {/* Balance inicial */}
        <View className="gap-2">
          <Text className="text-base text-text-light">Balance inicial</Text>
          <FormField
            control={control}
            name="balance"
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
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

      {/* Botón Crear */}
      <View className="p-4">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        >
          Crear cuenta
        </Button>
      </View>
    </SafeAreaView>
  );
}
