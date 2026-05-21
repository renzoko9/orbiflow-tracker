import {
  Alert as RNAlert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, Pencil, Trash2 } from "lucide-react-native";
import { Alert, Loading, ScreenHeader, showToast } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency, formatDate } from "@/shared/i18n";
import { ApiError } from "@/shared/api";
import { useDeleteTransfer, useTransfer } from "../api";

const tabular = { fontVariant: ["tabular-nums" as const] };

export function TransferDetailScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { data: transfer, isLoading, error } = useTransfer(groupId);
  const deleteTransfer = useDeleteTransfer();

  const handleEdit = () => {
    router.push({
      pathname: "/transactions/transfer/[groupId]/edit",
      params: { groupId },
    });
  };

  const handleDelete = () => {
    RNAlert.alert(
      "Eliminar transferencia",
      "Se revertiran los balances de ambas cuentas. Esta accion no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            deleteTransfer.mutate(groupId, {
              onSuccess: () => {
                showToast({ type: "success", text1: "Transferencia eliminada" });
                router.back();
              },
              onError: (err) => {
                const message =
                  err instanceof ApiError
                    ? err.message
                    : "No se pudo eliminar la transferencia";
                showToast({ type: "error", text1: "Error", text2: message });
              },
            }),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Transferencia" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error || !transfer) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Transferencia" />
        <View className="px-4 pt-4">
          <Alert
            variant="error"
            message={error?.message ?? "No se encontro la transferencia"}
          />
        </View>
      </SafeAreaView>
    );
  }

  const hasDescription = transfer.description?.trim().length > 0;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <ScreenHeader
        title="Transferencia"
        rightAction={
          <TouchableOpacity
            onPress={handleEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Editar transferencia"
          >
            <Pencil size={22} color={tokens.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4 pb-8">
          <Text
            className="text-[10px] font-sans-bold uppercase text-textTertiary mb-3"
            style={{ letterSpacing: 1.2 }}
          >
            {formatDate(transfer.date)}
          </Text>

          <Text
            className="text-[44px] font-display-bold text-textPrimary"
            style={[{ lineHeight: 60, includeFontPadding: false }, tabular]}
          >
            {formatCurrency(transfer.amount)}
          </Text>

          {hasDescription && (
            <Text className="text-lg font-sans-medium text-textPrimary mt-3">
              {transfer.description}
            </Text>
          )}
        </View>

        <View className="h-px bg-border mx-5" />

        <View className="px-5 py-6 gap-5">
          <View>
            <Text
              className="text-[10px] font-sans-bold uppercase text-textTertiary mb-3"
              style={{ letterSpacing: 0.5 }}
            >
              Movimiento entre cuentas
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-1 rounded-2xl bg-surface px-4 py-3 border border-border">
                <Text
                  className="text-[10px] font-sans-bold uppercase text-textTertiary mb-1"
                  style={{ letterSpacing: 0.4 }}
                >
                  De
                </Text>
                <Text
                  className="text-base font-sans-semibold text-textPrimary"
                  numberOfLines={1}
                >
                  {transfer.sourceAccount.name}
                </Text>
                <Text
                  className="text-xs text-textTertiary mt-1"
                  style={tabular}
                >
                  {formatCurrency(transfer.sourceAccount.balance)}
                </Text>
              </View>
              <ArrowRight size={20} color={tokens.brand} />
              <View className="flex-1 rounded-2xl bg-surface px-4 py-3 border border-border">
                <Text
                  className="text-[10px] font-sans-bold uppercase text-textTertiary mb-1"
                  style={{ letterSpacing: 0.4 }}
                >
                  A
                </Text>
                <Text
                  className="text-base font-sans-semibold text-textPrimary"
                  numberOfLines={1}
                >
                  {transfer.destinationAccount.name}
                </Text>
                <Text
                  className="text-xs text-textTertiary mt-1"
                  style={tabular}
                >
                  {formatCurrency(transfer.destinationAccount.balance)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pt-4 pb-6 border-t border-border bg-background">
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleteTransfer.isPending}
          className="flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-danger/40 active:bg-dangerSoft"
          accessibilityRole="button"
          accessibilityLabel="Eliminar transferencia"
        >
          <Trash2 size={16} color={tokens.danger} />
          <Text className="text-base font-sans-bold text-danger ml-2">
            Eliminar transferencia
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
