import { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil, Trash2, ArrowRight, RotateCcw } from "lucide-react-native";
import { colors } from "@/src/ui/theme/colors";
import { Alert as AlertBox, showToast } from "@/src/ui/components/atoms";
import {
  ScreenHeader,
  AIInsightsCard,
  KebabMenu,
  type KebabMenuItem,
} from "@/src/ui/components/molecules";
import {
  AccountHero,
  AccountMonthStats,
} from "@/src/ui/features/accounts";
import { TransactionItem } from "@/src/ui/features/transactions";
import {
  useAccount,
  useTransactionsByAccount,
  useArchiveAccount,
  useRestoreAccount,
} from "@/src/ui/hooks";
import {
  aggregateMonth,
  getCurrentMonthRange,
  getCurrentMonthName,
} from "@/src/ui/features/home/aggregate-transactions";
import { ApiError } from "@/src/core/api/api-error";

export default function AccountDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accountId = Number(id);

  const { data: account, isLoading, error } = useAccount(accountId);
  const { data: transactions = [] } = useTransactionsByAccount(accountId);
  const archiveAccount = useArchiveAccount();
  const restoreAccount = useRestoreAccount();

  const isArchived = account?.archivedAt !== null && account?.archivedAt !== undefined;

  const monthSummary = useMemo(() => {
    const { dateFrom, dateTo } = getCurrentMonthRange();
    const inMonth = transactions.filter((tx) => {
      const txDate =
        typeof tx.date === "string" ? tx.date.split("T")[0] : String(tx.date);
      return txDate >= dateFrom && txDate <= dateTo;
    });
    return aggregateMonth(inMonth);
  }, [transactions]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 3),
    [transactions],
  );

  const handleArchive = () => {
    if (!account) return;
    Alert.alert(
      `¿Eliminar "${account.name}"?`,
      'La cuenta se archivará: el historial de movimientos se conserva, pero dejará de contar en tus totales y no podrás registrar nuevos movimientos en ella.\n\nPodrás restaurarla luego desde "Cuentas archivadas".',
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
                  text2: `Se archivó "${account.name}"`,
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
            });
          },
        },
      ],
    );
  };

  const handleRestore = () => {
    if (!account) return;
    Alert.alert(
      `¿Restaurar "${account.name}"?`,
      "La cuenta volverá a estar activa. Podrás registrar nuevos movimientos en ella y volverá a contar en tus totales.",
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
                    : "Ocurrió un error inesperado";
                showToast({
                  type: "error",
                  text1: "Error",
                  text2: message,
                });
              },
            });
          },
        },
      ],
    );
  };

  const menuItems: KebabMenuItem[] = isArchived
    ? [
        {
          label: "Restaurar",
          icon: <RotateCcw size={18} color={colors.text.light} />,
          onPress: handleRestore,
        },
      ]
    : [
        {
          label: "Editar",
          icon: <Pencil size={18} color={colors.text.light} />,
          onPress: () =>
            router.push({
              pathname: "/accounts/edit/[id]",
              params: { id: String(accountId) },
            }),
        },
        {
          label: "Eliminar",
          icon: <Trash2 size={18} color={colors.error.medium} />,
          onPress: handleArchive,
          variant: "danger",
        },
      ];

  return (
    <SafeAreaView className="flex-1 bg-inverse">
      <ScreenHeader
        title="Detalle de cuenta"
        rightAction={account ? <KebabMenu items={menuItems} /> : null}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary[5]} />
        </View>
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
            {isArchived && (
              <View className="rounded-2xl bg-primary-1 px-4 py-3 mb-4">
                <Text className="text-sm text-primary-7">
                  Esta cuenta está archivada. El historial se conserva, pero no
                  cuenta en tus totales ni admite nuevos movimientos.
                </Text>
              </View>
            )}

            {!isArchived && (
              <AccountMonthStats
                monthName={getCurrentMonthName()}
                income={monthSummary.income}
                expenses={monthSummary.expenses}
              />
            )}

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-text-light">
                Movimientos recientes
              </Text>
              {!isArchived && transactions.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/transactions")}
                  hitSlop={8}
                  className="flex-row items-center gap-1"
                >
                  <Text className="text-sm font-medium text-primary-6">
                    Ver todos
                  </Text>
                  <ArrowRight size={14} color={colors.primary[6]} />
                </TouchableOpacity>
              )}
            </View>

            {recentTransactions.length === 0 ? (
              <View className="rounded-2xl bg-background-light px-4 py-8 mb-4 items-center">
                <Text className="text-subordinary text-sm">
                  Aún no hay movimientos en esta cuenta
                </Text>
              </View>
            ) : (
              <View
                className="rounded-2xl bg-background-light overflow-hidden mb-4"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {recentTransactions.map((tx, idx) => {
                  const isLast = idx === recentTransactions.length - 1;
                  return (
                    <View
                      key={tx.id}
                      className={!isLast ? "border-b border-primary-1" : ""}
                    >
                      <TransactionItem
                        categoryName={tx.category?.name ?? "Sin categoría"}
                        categoryIcon={tx.category?.icon ?? "tag"}
                        categoryColor={tx.category?.color ?? "#a6a6a6"}
                        description={tx.description}
                        amount={tx.amount}
                        type={tx.type}
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {!isArchived && (
              <AIInsightsCard
                title="Análisis inteligente"
                description={`Próximamente: insights específicos sobre tus movimientos en "${account.name}".`}
              />
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
