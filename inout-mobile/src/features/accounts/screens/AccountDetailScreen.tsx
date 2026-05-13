import { Alert as RNAlert, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, RotateCcw, Trash2 } from "lucide-react-native";
import { ApiError } from "@/shared/api";
import {
  Alert as AlertBox,
  KebabMenu,
  Loading,
  ScreenHeader,
  showToast,
  type KebabMenuItem,
} from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { getCurrentMonthLabel } from "@/shared/utils";
import { AccountHero, AccountMonthStats } from "../components";
import {
  useAccount,
  useArchiveAccount,
  useRestoreAccount,
} from "../api";
import { isArchived } from "../model";

export function AccountDetailScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const { data: account, isLoading, error } = useAccount(accountId);
  const archiveAccount = useArchiveAccount();
  const restoreAccount = useRestoreAccount();

  const archived = account ? isArchived(account) : false;

  const handleArchive = () => {
    if (!account) return;
    RNAlert.alert(
      `Eliminar "${account.name}"?`,
      'La cuenta se archivara: el historial de movimientos se conserva, pero dejara de contar en tus totales y no podras registrar nuevos movimientos en ella.\n\nPodras restaurarla luego desde "Cuentas archivadas".',
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            archiveAccount.mutate(accountId, {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Cuenta eliminada",
                  text2: `Se archivo "${account.name}"`,
                });
                router.back();
              },
              onError: (err) => {
                const message =
                  err instanceof ApiError
                    ? err.message
                    : "Ocurrio un error inesperado";
                showToast({ type: "error", text1: "Error", text2: message });
              },
            });
          },
        },
      ],
    );
  };

  const handleRestore = () => {
    if (!account) return;
    RNAlert.alert(
      `Restaurar "${account.name}"?`,
      "La cuenta volvera a estar activa. Podras registrar nuevos movimientos en ella y volvera a contar en tus totales.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: () => {
            restoreAccount.mutate(accountId, {
              onSuccess: () => {
                showToast({
                  type: "success",
                  text1: "Cuenta restaurada",
                  text2: `"${account.name}" vuelve a estar activa`,
                });
                router.back();
              },
              onError: (err) => {
                const message =
                  err instanceof ApiError
                    ? err.message
                    : "Ocurrio un error inesperado";
                showToast({ type: "error", text1: "Error", text2: message });
              },
            });
          },
        },
      ],
    );
  };

  const menuItems: KebabMenuItem[] = archived
    ? [
        {
          label: "Restaurar",
          icon: <RotateCcw size={18} color={tokens.textPrimary} />,
          onPress: handleRestore,
        },
      ]
    : [
        {
          label: "Editar",
          icon: <Pencil size={18} color={tokens.textPrimary} />,
          onPress: () =>
            router.push({
              pathname: "/accounts/edit/[id]",
              params: { id: String(accountId) },
            }),
        },
        {
          label: "Eliminar",
          icon: <Trash2 size={18} color={tokens.danger} />,
          onPress: handleArchive,
          variant: "danger",
        },
      ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        title="Detalle de cuenta"
        rightAction={account ? <KebabMenu items={menuItems} /> : null}
      />

      {isLoading ? (
        <Loading />
      ) : error || !account ? (
        <View className="px-4 mt-4">
          <AlertBox
            variant="error"
            message={error?.message ?? "No se pudo cargar la cuenta"}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <AccountHero
            name={account.name}
            balance={account.balance}
            description={account.description}
            icon={account.icon}
            color={account.color}
          />

          <View className="px-4">
            {archived ? (
              <View className="rounded-2xl bg-brandSoft px-4 py-3 mb-4">
                <Text className="text-sm text-brand">
                  Esta cuenta esta archivada. El historial se conserva, pero no
                  cuenta en tus totales ni admite nuevos movimientos.
                </Text>
              </View>
            ) : (
              <AccountMonthStats
                monthName={getCurrentMonthLabel()}
                income={0}
                expenses={0}
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
