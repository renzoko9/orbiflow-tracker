import {
  Alert as RNAlert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, RotateCcw, Trash2 } from "lucide-react-native";
import { ApiError } from "@/shared/api";
import {
  Alert as AlertBox,
  Loading,
  ScreenHeader,
  showToast,
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

  const handleEdit = () => {
    router.push({
      pathname: "/accounts/edit/[id]",
      params: { id: String(accountId) },
    });
  };

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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Detalle" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error || !account) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Detalle" />
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
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <ScreenHeader
        title="Detalle"
        rightAction={
          archived ? null : (
            <TouchableOpacity
              onPress={handleEdit}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Editar cuenta"
            >
              <Pencil size={22} color={tokens.textPrimary} />
            </TouchableOpacity>
          )
        }
      />

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

        <View className="h-px bg-border mx-5" />

        <View className="px-5 pt-6">
          {archived ? (
            <View
              className="rounded-2xl px-4 py-4"
              style={{ backgroundColor: tokens.brand + "14" }}
            >
              <Text
                className="text-[10px] font-sans-bold uppercase text-brand mb-1"
                style={{ letterSpacing: 1.2 }}
              >
                Cuenta archivada
              </Text>
              <Text className="text-sm text-textPrimary leading-5">
                El historial de movimientos se conserva, pero no cuenta en tus
                totales ni admite nuevos movimientos.
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

      <View className="px-5 pt-4 pb-6 border-t border-border bg-background">
        {archived ? (
          <TouchableOpacity
            onPress={handleRestore}
            disabled={restoreAccount.isPending}
            className="flex-row items-center justify-center px-4 py-3.5 rounded-xl bg-brand active:bg-brandStrong"
            accessibilityRole="button"
            accessibilityLabel="Restaurar cuenta"
          >
            <RotateCcw size={16} color={tokens.onBrand} />
            <Text className="text-base font-sans-bold text-onBrand ml-2">
              Restaurar cuenta
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleArchive}
            disabled={archiveAccount.isPending}
            className="flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-danger/40 active:bg-dangerSoft"
            accessibilityRole="button"
            accessibilityLabel="Eliminar cuenta"
          >
            <Trash2 size={16} color={tokens.danger} />
            <Text className="text-base font-sans-bold text-danger ml-2">
              Eliminar cuenta
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
