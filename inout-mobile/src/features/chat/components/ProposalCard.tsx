import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Check, X } from "lucide-react-native";
import { useThemeTokens } from "@/shared/theme";
import { formatCurrency, formatDate } from "@/shared/i18n";
import { resolveAvatarUrl } from "@/shared/utils";
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
  if (!message.payload) return null;

  if (message.status === "pending") {
    return (
      <PendingProposal
        payload={message.payload}
        isConfirming={isConfirming}
        isCancelling={isCancelling}
        onConfirm={() => onConfirm(message.id)}
        onCancel={() => onCancel(message.id)}
        onPressImage={onPressImage}
      />
    );
  }

  return (
    <ResolvedProposalChip
      payload={message.payload}
      status={message.status ?? "cancelled"}
    />
  );
}

function PendingProposal({
  payload,
  isConfirming,
  isCancelling,
  onConfirm,
  onCancel,
  onPressImage,
}: {
  payload: ChatProposalPayload;
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
        <DetailRow label="Categoria" value={payload.categoryName} />
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

function ResolvedProposalChip({
  payload,
  status,
}: {
  payload: ChatProposalPayload;
  status: "confirmed" | "cancelled";
}) {
  const tokens = useThemeTokens();
  const router = useRouter();
  const isConfirmed = status === "confirmed";
  const isIncome = payload.type === 1;
  const sign = isIncome ? "+" : "-";

  const accentColor = isConfirmed ? tokens.success : tokens.textTertiary;
  const label = isConfirmed ? "Registrado" : "Cancelado";

  const goToDetail = () => {
    if (isConfirmed && payload.transactionId) {
      router.push({
        pathname: "/transactions/[id]",
        params: { id: String(payload.transactionId) },
      });
    }
  };

  return (
    <Animated.View entering={FadeIn.duration(220)}>
      <Pressable
        onPress={goToDetail}
        disabled={!isConfirmed || !payload.transactionId}
        className="flex-row items-center gap-2 rounded-xl px-3 py-2 bg-surface"
        style={{
          borderWidth: 1,
          borderColor: tokens.border,
          borderTopLeftRadius: 4,
          opacity: isConfirmed ? 1 : 0.7,
        }}
      >
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 22,
            height: 22,
            backgroundColor: isConfirmed
              ? tokens.successSoft
              : tokens.surfaceMuted,
          }}
        >
          {isConfirmed ? (
            <Check size={14} color={accentColor} strokeWidth={3} />
          ) : (
            <X size={14} color={accentColor} strokeWidth={3} />
          )}
        </View>
        <Text
          className="text-xs font-sans-semibold uppercase"
          style={{ color: accentColor }}
        >
          {label}
        </Text>
        <Text className="text-sm text-textPrimary" numberOfLines={1}>
          {sign} {formatCurrency(payload.amount)}
          {payload.description ? ` · ${payload.description}` : ""}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-6">
      <Text className="text-xs text-textTertiary">{label}</Text>
      <Text className="text-xs text-textSecondary">{value}</Text>
    </View>
  );
}
