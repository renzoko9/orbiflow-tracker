import {
  Alert as RNAlert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, Trash2 } from "lucide-react-native";
import { Alert, Loading, ScreenHeader, showToast } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency, formatDate } from "@/shared/i18n";
import { getIconComponent } from "@/shared/utils";
import { TransactionType } from "@/features/categories";
import { useDeleteTransaction, useTransaction } from "../api";

const tabular = { fontVariant: ["tabular-nums" as const] };

export function TransactionDetailScreen() {
  const router = useRouter();
  const tokens = useThemeTokens();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);

  const {
    data: transaction,
    isLoading,
    error,
  } = useTransaction(transactionId);
  const deleteTransaction = useDeleteTransaction();

  const handleEdit = () => {
    router.push({
      pathname: "/transactions/[id]/edit",
      params: { id: String(transactionId) },
    });
  };

  const handleDelete = () => {
    RNAlert.alert("Eliminar movimiento", "Esta accion no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          deleteTransaction.mutate(transactionId, {
            onSuccess: () => {
              showToast({ type: "success", text1: "Movimiento eliminado" });
              router.back();
            },
            onError: () =>
              showToast({
                type: "error",
                text1: "Error",
                text2: "No se pudo eliminar el movimiento",
              }),
          }),
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Detalle" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error || !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenHeader title="Detalle" />
        <View className="px-4 pt-4">
          <Alert
            variant="error"
            message={error?.message ?? "No se encontro el movimiento"}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isExpense = transaction.type === TransactionType.EXPENSE;
  const sign = isExpense ? "−" : "+";
  const amountClass = isExpense ? "text-danger" : "text-success";
  const typeLabel = isExpense ? "Gasto" : "Ingreso";
  const categoryName = transaction.category?.name ?? "Sin categoria";
  const categoryIcon = transaction.category?.icon ?? "tag";
  const categoryColor = transaction.category?.color ?? "#a6a6a6";
  const Icon = getIconComponent(categoryIcon);
  const hasDescription = transaction.description?.trim().length > 0;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <ScreenHeader
        title="Detalle"
        rightAction={
          <TouchableOpacity
            onPress={handleEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Editar movimiento"
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
            {formatDate(transaction.date)}
          </Text>

          <Text
            className={`text-[44px] font-display-bold ${amountClass}`}
            style={[{ lineHeight: 60, includeFontPadding: false }, tabular]}
          >
            {sign} {formatCurrency(transaction.amount)}
          </Text>

          {hasDescription && (
            <Text className="text-lg font-sans-medium text-textPrimary mt-3">
              {transaction.description}
            </Text>
          )}
        </View>

        <View className="h-px bg-border mx-5" />

        <View className="px-5 py-6 gap-5">
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[10px] font-sans-bold uppercase text-textTertiary"
              style={{ letterSpacing: 0.5 }}
            >
              Tipo
            </Text>
            <Text className={`text-base font-sans-medium ${amountClass}`}>
              {typeLabel}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text
              className="text-[10px] font-sans-bold uppercase text-textTertiary"
              style={{ letterSpacing: 0.5 }}
            >
              Categoria
            </Text>
            <View className="flex-row items-center gap-2.5">
              <View
                className="w-7 h-7 rounded-lg items-center justify-center"
                style={{ backgroundColor: categoryColor + "1F" }}
              >
                <Icon size={14} color={categoryColor} />
              </View>
              <Text className="text-base font-sans-medium text-textPrimary">
                {categoryName}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text
              className="text-[10px] font-sans-bold uppercase text-textTertiary"
              style={{ letterSpacing: 0.5 }}
            >
              Cuenta
            </Text>
            <Text className="text-base font-sans-medium text-textPrimary">
              {transaction.account.name}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pt-4 pb-6 border-t border-border bg-background">
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleteTransaction.isPending}
          className="flex-row items-center justify-center px-4 py-3.5 rounded-xl border border-danger/40 active:bg-dangerSoft"
          accessibilityRole="button"
          accessibilityLabel="Eliminar movimiento"
        >
          <Trash2 size={16} color={tokens.danger} />
          <Text className="text-base font-sans-bold text-danger ml-2">
            Eliminar movimiento
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
