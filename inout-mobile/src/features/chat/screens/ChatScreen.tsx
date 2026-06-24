import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ArrowDown, Plus, Send, Sparkles, X } from "lucide-react-native";
import { ScreenHeader, showToast, type BottomSheetModal } from "@/shared/ui";
import { useThemeTokens } from "@/shared/theme";
import { formatTime } from "@/shared/i18n";
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
  const [showScrollDown, setShowScrollDown] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const attachMenuRef = useRef<BottomSheetModal>(null);

  const {
    data: conversation,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversation();
  const sendMessage = useSendMessage();
  const confirmProposal = useConfirmProposal();
  const cancelProposal = useCancelProposal();

  // Lista invertida: data va de mas nuevo a mas viejo y el fondo es el offset 0.
  // Cada pagina viene ASC; la invertimos y concatenamos en orden de paginas
  // (pages[0] = la mas nueva), quedando todo en orden descendente.
  const data = useMemo(
    () => conversation?.pages.flatMap((p) => [...p.messages].reverse()) ?? [],
    [conversation],
  );

  // Salta al fondo solo cuando llega un mensaje NUEVO (cambia el id mas reciente),
  // no al paginar hacia atras (que solo agrega mensajes viejos al final).
  const newestId = data[0]?.id;
  useEffect(() => {
    if (newestId !== undefined) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [newestId, sendMessage.isPending]);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    // Lista invertida: y crece a medida que el usuario sube. Mostramos el boton
    // cuando se aleja del fondo (offset 0).
    setShowScrollDown(e.nativeEvent.contentOffset.y > 400);
  }

  function scrollToBottom() {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

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

  const showEmptyState = data.length === 0 && !sendMessage.isPending;
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
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.3}
            ListHeaderComponent={
              sendMessage.isPending ? <TypingBubble /> : null
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="items-center py-3">
                  <ActivityIndicator color={tokens.textTertiary} />
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {showScrollDown && !showEmptyState ? (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(150)}
            className="absolute right-4"
            style={{ bottom: 72 }}
          >
            <Pressable
              onPress={scrollToBottom}
              className="items-center justify-center rounded-full bg-surface opacity-80"
              style={{
                width: 40,
                height: 40,
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            >
              <ArrowDown size={20} color={tokens.textSecondary} strokeWidth={2.2} />
            </Pressable>
          </Animated.View>
        ) : null}

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

// Markdown inline minimo (solo **negrita** y *cursiva*/_cursiva_) para las
// respuestas de Otto. Devuelve nodos que viven dentro del <Text> de la burbuja,
// asi no rompe el truco de la hora inline. La negrita usa la familia real
// (Inter no hace bold sintetico en Android); la cursiva usa fontStyle.
function renderInlineMarkdown(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part);
    if (bold) {
      return (
        <Text key={`b${i}`} style={{ fontFamily: "Inter_700Bold" }}>
          {renderItalic(bold[1] ?? "", `b${i}`)}
        </Text>
      );
    }
    return renderItalic(part, `t${i}`);
  });
}

function renderItalic(text: string, prefix: string): React.ReactNode[] {
  return text.split(/(\*[^*]+\*|_[^_]+_)/g).map((part, i) => {
    const italic = /^(?:\*([^*]+)\*|_([^_]+)_)$/.exec(part);
    if (italic) {
      return (
        <Text key={`${prefix}i${i}`} style={{ fontStyle: "italic" }}>
          {italic[1] ?? italic[2]}
        </Text>
      );
    }
    return part;
  });
}

type CellAlign = "left" | "center" | "right";
type Block =
  | { type: "text"; text: string }
  | { type: "table"; header: string[]; rows: string[][]; aligns: CellAlign[] };

const isTableRow = (l?: string) => !!l && /^\s*\|.*\|\s*$/.test(l);
const isSeparatorRow = (l?: string) =>
  !!l && l.includes("-") && /^\s*\|?[\s:|-]+\|?\s*$/.test(l);

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

// Parte el contenido en bloques de texto y tablas (markdown GitHub). Solo se usa
// cuando hay una tabla; los mensajes normales siguen por el camino inline.
function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let textBuf: string[] = [];

  const flushText = () => {
    const t = textBuf.join("\n").trim();
    if (t) blocks.push({ type: "text", text: t });
    textBuf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const next = lines[i + 1];
    if (isTableRow(line) && isSeparatorRow(next)) {
      flushText();
      const header = splitRow(line);
      const aligns: CellAlign[] = splitRow(next ?? "").map((c) => {
        const l = c.startsWith(":");
        const r = c.endsWith(":");
        return l && r ? "center" : r ? "right" : "left";
      });
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && isTableRow(lines[j])) {
        rows.push(splitRow(lines[j] ?? ""));
        j++;
      }
      blocks.push({ type: "table", header, rows, aligns });
      i = j - 1;
      continue;
    }
    textBuf.push(line);
  }
  flushText();
  return blocks;
}

function TableView({
  header,
  rows,
  aligns,
}: {
  header: string[];
  rows: string[][];
  aligns: CellAlign[];
}) {
  const tokens = useThemeTokens();
  const cols = header.length;

  return (
    <View
      className="rounded-xl overflow-hidden"
      style={{ borderWidth: 1, borderColor: tokens.border }}
    >
      <View className="flex-row" style={{ backgroundColor: tokens.surfaceMuted }}>
        {header.map((cell, c) => (
          <View
            key={c}
            className="flex-1 px-2.5 py-1.5"
            style={c > 0 ? { borderLeftWidth: 1, borderColor: tokens.border } : undefined}
          >
            <Text
              className="text-xs font-sans-bold text-textPrimary"
              style={{ textAlign: aligns[c] ?? "left" }}
            >
              {renderInlineMarkdown(cell)}
            </Text>
          </View>
        ))}
      </View>
      {rows.map((row, r) => (
        <View
          key={r}
          className="flex-row"
          style={{ borderTopWidth: 1, borderColor: tokens.border }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <View
              key={c}
              className="flex-1 px-2.5 py-1.5"
              style={c > 0 ? { borderLeftWidth: 1, borderColor: tokens.border } : undefined}
            >
              <Text
                className="text-xs text-textPrimary"
                style={{ textAlign: aligns[c] ?? "left" }}
              >
                {renderInlineMarkdown(row[c] ?? "")}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
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
  const time = formatTime(message.createdAt);
  const hasText = !!message.content;

  // Solo los mensajes de Otto pueden traer markdown de bloque (tablas). Si hay
  // una tabla, no se puede usar la hora inline (es layout de bloque): la hora
  // va en su propia linea. Los mensajes sin tabla siguen el camino inline.
  const blocks = !isUser && hasText ? parseBlocks(message.content) : null;
  const hasTable = blocks?.some((b) => b.type === "table") ?? false;

  return (
    <View
      className={
        hasTable
          ? "self-stretch"
          : `max-w-[85%] ${isUser ? "self-end items-end" : "self-start items-start"
          }`
      }
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
          {!hasText && (
            <View
              className="absolute bottom-2 right-2 rounded-full px-2 py-0.5"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            >
              <Text className="text-[11px]" style={{ color: "#FFFFFF" }}>
                {time}
              </Text>
            </View>
          )}
        </Pressable>
      )}
      {hasText && hasTable && blocks ? (
        <View
          className="rounded-2xl px-4 py-2.5 bg-surface"
          style={{
            borderTopLeftRadius: 4,
            borderWidth: 1,
            borderColor: tokens.border,
            gap: 8,
          }}
        >
          {blocks.map((block, i) =>
            block.type === "table" ? (
              <TableView
                key={i}
                header={block.header}
                rows={block.rows}
                aligns={block.aligns}
              />
            ) : (
              <Text key={i} className="text-base leading-6 text-textPrimary">
                {renderInlineMarkdown(block.text)}
              </Text>
            ),
          )}
          <Text
            className="self-end text-[11px]"
            style={{ color: tokens.textTertiary }}
          >
            {time}
          </Text>
        </View>
      ) : hasText ? (
        <View
          className={`rounded-2xl px-4 py-2.5 ${isUser ? "bg-brand" : "bg-surface"
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
            className={`text-base leading-6 ${isUser ? "text-onBrand" : "text-textPrimary"
              }`}
          >
            {isUser
              ? message.content
              : renderInlineMarkdown(message.content)}
            {/* Reserva el ancho de la hora al final de la ultima linea: si cabe,
                la hora absoluta de abajo queda al lado; si no, baja sola. */}
            {"     "}
            <Text className="text-[11px]" style={{ opacity: 0 }}>
              {time}
            </Text>
          </Text>
          <Text
            className="absolute text-[11px]"
            style={{
              right: 14,
              bottom: 7,
              color: isUser ? tokens.onBrand : tokens.textTertiary,
              opacity: isUser ? 0.7 : 1,
            }}
          >
            {time}
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
