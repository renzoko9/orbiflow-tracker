import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { colors } from "@/src/ui/theme/colors";
import {
  Button,
  showToast,
  CircleSelector,
  Alert as AlertBox,
} from "@/src/ui/components/atoms";
import type { CircleSelectorItem } from "@/src/ui/components/atoms";
import { FormField, ScreenHeader } from "@/src/ui/components/molecules";
import {
  updateAccountSchema,
  UpdateAccountFormValues,
} from "@/src/core/schemas/account/update-account.schema";
import { useAccount, useUpdateAccount } from "@/src/ui/hooks";
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

const colorItems: CircleSelectorItem[] = ACCOUNT_COLORS.map((c, index) => ({
  id: index,
  label: "",
  icon: null,
  color: c,
}));

export default function EditAccountScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const { data: account, isLoading, error } = useAccount(accountId);
  const updateAccount = useUpdateAccount(accountId);

  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<UpdateAccountFormValues>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: "",
      description: undefined,
      icon: DEFAULT_ACCOUNT_ICON,
      color: DEFAULT_ACCOUNT_COLOR,
    },
  });

  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        description: account.description ?? undefined,
        icon: account.icon,
        color: account.color,
      });
    }
  }, [account, reset]);

  const selectedColor = watch("color") ?? DEFAULT_ACCOUNT_COLOR;
  const iconItems = buildIconItems(selectedColor);

  const onSubmit = (data: UpdateAccountFormValues) => {
    updateAccount.mutate(
      {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
      },
      {
        onSuccess: () => {
          showToast({
            type: "success",
            text1: "Cuenta actualizada",
            text2: "Los cambios se guardaron correctamente",
          });
          router.back();
        },
        onError: (err) => {
          const message =
            err instanceof ApiError
              ? err.message
              : "Ocurrió un error inesperado";
          showToast({
            type: "error",
            text1: "Error",
            text2: message,
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Editar cuenta" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !account) {
    return (
      <SafeAreaView className="flex-1 bg-inverse">
        <ScreenHeader title="Editar cuenta" />
        <View className="px-4 mt-4">
          <AlertBox
            variant="error"
            message={error?.message ?? "No se pudo cargar la cuenta"}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader title="Editar cuenta" />

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

          {/* Balance (read-only) */}
          <View className="gap-2">
            <Text className="text-base text-text-light">Balance</Text>
            <View className="rounded-xl bg-primary-1 px-4 py-3">
              <Text className="text-base text-text-light">
                S/ {Number(account.balance).toFixed(2)}
              </Text>
            </View>
            <Text className="text-xs text-subordinary">
              El balance se ajusta registrando movimientos
            </Text>
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
      </KeyboardAvoidingView>

      <View className="p-4">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit(onSubmit)}
          loading={updateAccount.isPending}
        >
          Guardar cambios
        </Button>
      </View>
    </SafeAreaView>
  );
}
