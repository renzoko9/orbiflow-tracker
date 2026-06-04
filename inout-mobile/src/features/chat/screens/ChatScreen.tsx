import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Plus, Send, Sparkles, X } from "lucide-react-native";
import { ScreenHeader, showToast, type BottomSheetModal } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { normalizeImageToJpeg, resolveAvatarUrl } from "@/shared/utils";
import { ApiError } from "@/shared/api";
import {
  AttachMenu,
  ImageViewer,
  ProposalCard,
  TypingBubble,
  useCancelProposal,
  useConfirmProposal,
  useConversation,
  useSendMessage,
  type ChatMessage,
  type SendMessageInput,
} from "@/features/chat";

const SUGGESTIONS = [
  "Gaste 20 soles en taxi",
  "Recibi mi sueldo de 3500",
  "Cuanto gaste en comida este mes?",
];

interface PendingImage {
  uri: string;
  mimeType: string;
  fileName: string;
}

export function ChatScreen() {
  const tokens = useThemeTokens();
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const attachMenuRef = useRef<BottomSheetModal>(null);

  const { data: conversation } = useConversation();
  const sendMessage = useSendMessage();
  const confirmProposal = useConfirmProposal();
  const cancelProposal = useCancelProposal();

  const messages = useMemo(
    () => conversation?.messages ?? [],
    [conversation],
  );

  // Lista invertida: data va de mas nuevo a mas viejo y el fondo es el
  // offset 0. Esto ancla el chat al fondo sin depender de scrollToEnd (que
  // con alturas variables se queda corto).
  const data = useMemo(() => messages.slice().reverse(), [messages]);

  // Al enviar/recibir saltamos al fondo (offset 0 es exacto en lista invertida).
  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages.length, sendMessage.isPending]);

  function showError(err: unknown) {
    const message =
      err instanceof ApiError ? err.message : "No pude enviar el mensaje";
    showToast({ type: "error", text1: "Error", text2: message });
  }

  async function handlePickImage(source: "camera" | "gallery") {
    const perm =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showToast({
        type: "error",
        text1: "Permiso denegado",
        text2:
          source === "camera"
            ? "Habilita el acceso a la camara"
            : "Habilita el acceso a la galeria",
      });
      return;
    }
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
          });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    try {
      const normalized = await normalizeImageToJpeg(asset.uri);
      setPendingImage(normalized);
    } catch {
      showToast({
        type: "error",
        text1: "Error",
        text2: "No se pudo procesar la imagen",
      });
    }
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && !pendingImage) return;
    if (sendMessage.isPending) return;

    const payload: SendMessageInput = {
      content: trimmed || undefined,
      imageUri: pendingImage?.uri,
      imageMimeType: pendingImage?.mimeType,
      imageFileName: pendingImage?.fileName,
    };

    setText("");
    setPendingImage(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    sendMessage.mutate(payload, { onError: showError });
  }

  function handleSuggestion(suggestion: string) {
    if (sendMessage.isPending) return;
    void Haptics.selectionAsync();
    setText(suggestion);
  }

  function handleConfirmProposal(id: number) {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    confirmProposal.mutate(id, { onError: showError });
  }

  function handleCancelProposal(id: number) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    cancelProposal.mutate(id, { onError: showError });
  }

  function handleOpenAttachMenu() {
    if (sendMessage.isPending) return;
    void Haptics.selectionAsync();
    attachMenuRef.current?.present();
  }

  const confirmingId =
    confirmProposal.isPending && typeof confirmProposal.variables === "number"
      ? confirmProposal.variables
      : null;
  const cancellingId =
    cancelProposal.isPending && typeof cancelProposal.variables === "number"
      ? cancelProposal.variables
      : null;

  const showEmptyState = messages.length === 0 && !sendMessage.isPending;
  const canSend =
    (text.trim().length > 0 || pendingImage !== null) && !sendMessage.isPending;

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      className="flex-1 bg-background"
    >
      <ScreenHeader
        titleAlign="left"
        title={
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center rounded-full bg-brand"
              style={{ width: 36, height: 36 }}
            >
              <Sparkles size={18} color={tokens.onBrand} strokeWidth={2.2} />
            </View>
            <View>
              <Text className="text-base font-sans-bold text-textPrimary">
                Otto
              </Text>
              <Text className="text-xs text-textTertiary">
                Asistente financiero
              </Text>
            </View>
          </View>
        }
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {showEmptyState ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 16,
              paddingTop: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            <EmptyState onPickSuggestion={handleSuggestion} />
          </ScrollView>
        ) : (
          <FlatList
            ref={listRef}
            data={data}
            inverted
            keyExtractor={(m) => String(m.id)}
            renderItem={({ item }) => (
              <Animated.View entering={FadeIn.duration(180)}>
                {item.kind === "proposal" && item.payload ? (
                  <View className="self-start max-w-[85%]">
                    <ProposalCard
                      message={item}
                      isConfirming={confirmingId === item.id}
                      isCancelling={cancellingId === item.id}
                      onConfirm={handleConfirmProposal}
                      onCancel={handleCancelProposal}
                      onPressImage={setViewerUri}
                    />
                  </View>
                ) : (
                  <Bubble message={item} onPressImage={setViewerUri} />
                )}
              </Animated.View>
            )}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 20,
              gap: 12,
            }}
            ListHeaderComponent={
              sendMessage.isPending ? <TypingBubble /> : null
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {pendingImage && (
          <View
            className="flex-row items-center gap-3 px-4 py-3"
            style={{ borderTopWidth: 1, borderColor: tokens.border }}
          >
            <Image
              source={{ uri: pendingImage.uri }}
              style={{ width: 48, height: 48, borderRadius: 8 }}
              contentFit="cover"
            />
            <Text className="flex-1 text-sm text-textSecondary">
              Imagen lista para enviar
            </Text>
            <TouchableOpacity
              onPress={() => setPendingImage(null)}
              hitSlop={8}
            >
              <X size={20} color={tokens.textTertiary} />
            </TouchableOpacity>
          </View>
        )}

        <View
          className="flex-row items-end gap-2 px-3 py-2 bg-background"
          style={{ borderTopWidth: 1, borderColor: tokens.border }}
        >
          <Pressable
            onPress={handleOpenAttachMenu}
            className="items-center justify-center rounded-full bg-surfaceMuted"
            style={{ width: 40, height: 40 }}
            disabled={sendMessage.isPending}
          >
            <Plus size={22} color={tokens.textSecondary} strokeWidth={2.2} />
          </Pressable>
          <View className="flex-1 px-4 py-2 rounded-2xl bg-surfaceMuted">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escribe o manda una foto..."
              placeholderTextColor={tokens.textTertiary}
              multiline
              style={{
                color: tokens.textPrimary,
                fontSize: 15,
                maxHeight: 100,
                minHeight: 20,
              }}
              editable={!sendMessage.isPending}
            />
          </View>
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            className="items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              backgroundColor: canSend ? tokens.brand : tokens.borderStrong,
            }}
          >
            <Send size={18} color={tokens.onBrand} strokeWidth={2.4} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <AttachMenu
        ref={attachMenuRef}
        onCamera={() => handlePickImage("camera")}
        onGallery={() => handlePickImage("gallery")}
      />

      <ImageViewer uri={viewerUri} onClose={() => setViewerUri(null)} />
    </SafeAreaView>
  );
}

function Bubble({
  message,
  onPressImage,
}: {
  message: ChatMessage;
  onPressImage: (uri: string) => void;
}) {
  const tokens = useThemeTokens();
  const isUser = message.role === "user";
  const imageUrl = resolveAvatarUrl(message.imageUrl);

  return (
    <View
      className={`max-w-[85%] ${isUser ? "self-end" : "self-start"}`}
      style={{ gap: 6 }}
    >
      {imageUrl && (
        <Pressable onPress={() => onPressImage(imageUrl)}>
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: 220,
              height: 220,
              borderRadius: 16,
              backgroundColor: tokens.surfaceMuted,
            }}
            contentFit="cover"
          />
        </Pressable>
      )}
      {message.content ? (
        <View
          className={`rounded-2xl px-4 py-3 ${
            isUser ? "bg-brand" : "bg-surface"
          }`}
          style={
            isUser
              ? { borderTopRightRadius: 4 }
              : {
                  borderTopLeftRadius: 4,
                  borderWidth: 1,
                  borderColor: tokens.border,
                }
          }
        >
          <Text
            className={`text-base leading-6 ${
              isUser ? "text-onBrand" : "text-textPrimary"
            }`}
          >
            {message.content}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function EmptyState({
  onPickSuggestion,
}: {
  onPickSuggestion: (s: string) => void;
}) {
  return (
    <View className="gap-3 mt-4">
      <View
        className="self-start rounded-2xl bg-surface px-4 py-3 max-w-[85%]"
        style={{ borderTopLeftRadius: 4 }}
      >
        <Text className="text-base text-textPrimary leading-6">
          Hola, soy Otto. Cuentame que gastaste o ingresaste y lo registro por
          ti.
        </Text>
      </View>
      <View
        className="self-start rounded-2xl bg-surface px-4 py-3 max-w-[85%]"
        style={{ borderTopLeftRadius: 4 }}
      >
        <Text className="text-base text-textPrimary leading-6">
          Tambien puedes mandarme una foto del voucher, producto o servicio y
          yo me encargo del resto.
        </Text>
      </View>
      <View className="self-start flex-row flex-wrap gap-2 mt-2">
        {SUGGESTIONS.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => onPickSuggestion(suggestion)}
            className="rounded-full bg-brandSoft px-3 py-2"
          >
            <Text className="text-xs font-sans-semibold text-brand">
              {suggestion}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
