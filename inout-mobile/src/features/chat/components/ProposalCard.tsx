import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Check, ChevronRight, X } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency, formatDate } from "@/shared/i18n";
import { resolveAvatarUrl } from "@/shared/utils";
import { useCategories } from "@/features/categories";
import type { ChatMessage, ChatProposalPayload } from "../model";

interface ProposalCardProps {
  message: ChatMessage;
  isConfirming: boolean;
  isCancelling: boolean;
  onConfirm: (id: number) => void;
  onCancel: (id: number) => void;
  onPressImage?: (uri: string) => void;
}

export function ProposalCard({
  message,
  isConfirming,
  isCancelling,
  onConfirm,
  onCancel,
  onPressImage,
}: ProposalCardProps) {
  const { data: categories } = useCategories();
  if (!message.payload) return null;
  const payload = message.payload;
  const categoryColor = categories.find(
    (c) => c.id === payload.categoryId,
  )?.color;

  if (message.status === "pending") {
    return (
      <PendingProposal
        payload={payload}
        categoryColor={categoryColor}
        isConfirming={isConfirming}
        isCancelling={isCancelling}
        onConfirm={() => onConfirm(message.id)}
        onCancel={() => onCancel(message.id)}
        onPressImage={onPressImage}
      />
    );
  }

  if (message.status === "confirmed") {
    return (
      <ConfirmedReceipt
        payload={payload}
        categoryColor={categoryColor}
        onPressImage={onPressImage}
      />
    );
  }

  return <CancelledChip payload={payload} />;
}

function PendingProposal({
  payload,
  categoryColor,
  isConfirming,
  isCancelling,
  onConfirm,
  onCancel,
  onPressImage,
}: {
  payload: ChatProposalPayload;
  categoryColor?: string;
  isConfirming: boolean;
  isCancelling: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onPressImage?: (uri: string) => void;
}) {
  const tokens = useThemeTokens();
  const isIncome = payload.type === 1;
  const amountColor = isIncome ? tokens.income : tokens.expense;
  const sign = isIncome ? "+" : "-";
  const photo = payload.photos?.[0] ? resolveAvatarUrl(payload.photos[0]) : null;
  const busy = isConfirming || isCancelling;

  return (
    <Animated.View
      entering={ZoomIn.duration(220)}
      className="bg-surface rounded-2xl overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: tokens.border,
        borderTopLeftRadius: 4,
      }}
    >
      <View
        className="px-4 py-2"
        style={{ borderBottomWidth: 1, borderColor: tokens.border }}
      >
        <Text className="text-xs font-sans-semibold uppercase text-textTertiary">
          Te propongo registrar
        </Text>
      </View>

      <View className="px-4 pt-3 pb-2">
        <Text
          className="text-2xl font-sans-extrabold"
          style={{ color: amountColor }}
        >
          {sign} {formatCurrency(payload.amount)}
        </Text>
        {payload.description ? (
          <Text className="text-base text-textPrimary mt-1">
            {payload.description}
          </Text>
        ) : null}
      </View>

      <View className="px-4 pb-3 gap-1">
        <DetailRow
          label="Categoria"
          value={payload.categoryName}
          color={categoryColor}
        />
        <DetailRow label="Cuenta" value={payload.accountName} />
        <DetailRow label="Fecha" value={formatDate(payload.date)} />
      </View>

      {photo && (
        <View className="px-4 pb-3">
          <Pressable
            onPress={onPressImage ? () => onPressImage(photo) : undefined}
            disabled={!onPressImage}
          >
            <Image
              source={{ uri: photo }}
              style={{
                width: "100%",
                height: 140,
                borderRadius: 12,
                backgroundColor: tokens.surfaceMuted,
              }}
              contentFit="cover"
            />
          </Pressable>
        </View>
      )}

      <View
        className="flex-row gap-2 px-3 pb-3 pt-2"
        style={{ borderTopWidth: 1, borderColor: tokens.border }}
      >
        <Pressable
          onPress={onCancel}
          disabled={busy}
          className="flex-1 items-center justify-center rounded-xl py-3 bg-surfaceMuted"
          style={{ opacity: busy ? 0.6 : 1 }}
        >
          {isCancelling ? (
            <ActivityIndicator size="small" color={tokens.textSecondary} />
          ) : (
            <Text className="text-sm font-sans-semibold text-textSecondary">
              Cancelar
            </Text>
          )}
        </Pressable>
        <Pressable
          onPress={onConfirm}
          disabled={busy}
          className="flex-1 items-center justify-center rounded-xl py-3 bg-brand"
          style={{ opacity: busy ? 0.7 : 1 }}
        >
          {isConfirming ? (
            <ActivityIndicator size="small" color={tokens.onBrand} />
          ) : (
            <Text className="text-sm font-sans-semibold text-onBrand">
              Confirmar
            </Text>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

function ConfirmedReceipt({
  payload,
  categoryColor,
  onPressImage,
}: {
  payload: ChatProposalPayload;
  categoryColor?: string;
  onPressImage?: (uri: string) => void;
}) {
  const tokens = useThemeTokens();
  const router = useRouter();
  const isIncome = payload.type === 1;
  const amountColor = isIncome ? tokens.income : tokens.expense;
  const sign = isIncome ? "+" : "-";
  const photo = payload.photos?.[0] ? resolveAvatarUrl(payload.photos[0]) : null;
  const canOpen = !!payload.transactionId;

  const goToDetail = () => {
    if (payload.transactionId) {
      router.push({
        pathname: "/transactions/[id]",
        params: { id: String(payload.transactionId) },
      });
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      className="bg-surface rounded-2xl overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: tokens.successSoft,
        borderTopLeftRadius: 4,
      }}
    >
      <View
        className="flex-row items-center gap-2 px-4 py-2"
        style={{ backgroundColor: tokens.surface, borderBottomColor: tokens.surfaceMuted, borderBottomWidth: 1, borderTopRightRadius: 16 }}
      >
        <Animated.View
          entering={ZoomIn.duration(280)}
          className="items-center justify-center rounded-full"
          style={{ width: 22, height: 22, backgroundColor: tokens.success }}
        >
          <Check size={14} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>
        <Text
          className="text-xs font-sans-bold uppercase"
          style={{ color: tokens.success, letterSpacing: 0.5 }}
        >
          Registrado
        </Text>
      </View>

      <View className="px-4 pt-3 pb-2">
        <Text
          className="text-2xl font-sans-extrabold"
          style={{ color: amountColor }}
        >
          {sign} {formatCurrency(payload.amount)}
        </Text>
        {payload.description ? (
          <Text className="text-base text-textPrimary mt-1">
            {payload.description}
          </Text>
        ) : null}
      </View>

      <View className="px-4 pb-3 gap-1">
        <DetailRow
          label="Categoria"
          value={payload.categoryName}
          color={categoryColor}
        />
        <DetailRow label="Cuenta" value={payload.accountName} />
        <DetailRow label="Fecha" value={formatDate(payload.date)} />
      </View>

      {photo && (
        <View className="px-4 pb-3">
          <Pressable
            onPress={onPressImage ? () => onPressImage(photo) : undefined}
            disabled={!onPressImage}
          >
            <Image
              source={{ uri: photo }}
              style={{
                width: "100%",
                height: 140,
                borderRadius: 12,
                backgroundColor: tokens.surfaceMuted,
              }}
              contentFit="cover"
            />
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={goToDetail}
        disabled={!canOpen}
        className="flex-row items-center justify-center gap-1 px-3 py-3"
        style={{
          borderTopWidth: 1,
          borderColor: tokens.border,
          opacity: canOpen ? 1 : 0.5,
        }}
      >
        <Text className="text-sm font-sans-semibold text-brand">
          Ver movimiento
        </Text>
        <ChevronRight size={16} color={tokens.brand} strokeWidth={2.4} />
      </Pressable>
    </Animated.View>
  );
}

function CancelledChip({ payload }: { payload: ChatProposalPayload }) {
  const tokens = useThemeTokens();
  const isIncome = payload.type === 1;
  const sign = isIncome ? "+" : "-";

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <View
        className="flex-row items-center gap-2 rounded-xl px-3 py-2 bg-surface"
        style={{
          borderWidth: 1,
          borderColor: tokens.border,
          borderTopLeftRadius: 4,
          opacity: 0.7,
        }}
      >
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            backgroundColor: tokens.surfaceMuted,
          }}
        >
          <X size={14} color={tokens.textTertiary} strokeWidth={3} />
        </View>
        <Text
          className="text-xs font-sans-semibold uppercase"
          style={{ color: tokens.textTertiary }}
        >
          Cancelado
        </Text>
        <Text className="text-sm text-textPrimary" numberOfLines={1}>
          {sign} {formatCurrency(payload.amount)}
          {payload.description ? ` · ${payload.description}` : ""}
        </Text>
      </View>
    </Animated.View>
  );
}

function DetailRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View className="flex-row justify-between gap-6">
      <Text className="text-xs text-textTertiary">{label}</Text>
      <View className="flex-row items-center gap-1.5" style={{ flexShrink: 1 }}>
        {color ? (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
            }}
          />
        ) : null}
        <Text className="text-xs text-textSecondary" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
