import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { accountKeys } from "@/features/accounts";
import { transactionKeys } from "@/features/transactions";
import * as chatApi from "./chat.api";
import { chatKeys } from "./chat.keys";
import type {
  ChatActionTaken,
  ChatMessage,
  ConversationPage,
  ResolveProposalResult,
  SendMessageInput,
  SendMessageResult,
} from "../model";

type ChatData = InfiniteData<ConversationPage>;

// Modifica solo la pagina mas nueva (pages[0]), donde se agregan los mensajes
// recientes. fetchNextPage anexa las paginas viejas al final del array.
function updateFirstPage(
  data: ChatData,
  fn: (messages: ChatMessage[]) => ChatMessage[],
): ChatData {
  return {
    ...data,
    pages: data.pages.map((page, i) =>
      i === 0 ? { ...page, messages: fn(page.messages) } : page,
    ),
  };
}

// Aplica fn a los mensajes de todas las paginas (para reemplazos/filtros por id,
// que pueden caer en cualquier pagina).
function updateAllPages(
  data: ChatData,
  fn: (messages: ChatMessage[]) => ChatMessage[],
): ChatData {
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, messages: fn(page.messages) })),
  };
}

export function useConversation() {
  return useInfiniteQuery({
    queryKey: chatKeys.conversation(),
    queryFn: ({ pageParam }) => chatApi.getConversation(pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) =>
      last.hasMore ? (last.nextCursor ?? undefined) : undefined,
    staleTime: 30 * 1000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation<
    SendMessageResult,
    Error,
    SendMessageInput,
    { tempId: number }
  >({
    mutationFn: chatApi.sendMessage,
    onMutate: (input) => {
      const tempId = -Date.now();
      const tempMessage: ChatMessage = {
        id: tempId,
        role: "user",
        content: input.content ?? "",
        imageUrl: input.imageUri ?? null,
        createdAt: new Date().toISOString(),
        kind: "text",
        payload: null,
        status: null,
      };
      queryClient.setQueryData<ChatData>(chatKeys.conversation(), (prev) => {
        if (!prev) return prev;
        const cancelled = updateAllPages(prev, (msgs) =>
          msgs.map((m) =>
            m.kind === "proposal" && m.status === "pending"
              ? { ...m, status: "cancelled" as const }
              : m,
          ),
        );
        return updateFirstPage(cancelled, (msgs) => [...msgs, tempMessage]);
      });
      return { tempId };
    },
    onError: (_err, _input, context) => {
      if (!context) return;
      queryClient.setQueryData<ChatData>(chatKeys.conversation(), (prev) => {
        if (!prev) return prev;
        return updateAllPages(prev, (msgs) =>
          msgs.filter((m) => m.id !== context.tempId),
        );
      });
    },
    onSuccess: (result, _input, context) => {
      queryClient.setQueryData<ChatData>(chatKeys.conversation(), (prev) => {
        if (!prev) return prev;
        // Conservamos el id temporal en el mensaje del usuario para no remontar
        // la burbuja (evita re-disparar la animacion de entrada).
        const replaced = updateAllPages(prev, (msgs) =>
          msgs.map((m) =>
            m.id === context?.tempId
              ? { ...result.userMessage, id: m.id }
              : m,
          ),
        );
        return updateFirstPage(replaced, (msgs) => [
          ...msgs,
          result.assistantMessage,
        ]);
      });

      invalidateOnTransactionCreated(queryClient, result.actionsTaken);
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: () => {
      queryClient.setQueryData<ChatData>(chatKeys.conversation(), {
        pages: [{ messages: [], hasMore: false, nextCursor: null }],
        pageParams: [undefined],
      });
    },
  });
}

export function useConfirmProposal() {
  const queryClient = useQueryClient();
  return useMutation<ResolveProposalResult, Error, number>({
    mutationFn: chatApi.confirmProposal,
    onSuccess: (result) => applyResolveResult(queryClient, result),
  });
}

export function useCancelProposal() {
  const queryClient = useQueryClient();
  return useMutation<ResolveProposalResult, Error, number>({
    mutationFn: chatApi.cancelProposal,
    onSuccess: (result) => applyResolveResult(queryClient, result),
  });
}

function applyResolveResult(
  queryClient: QueryClient,
  result: ResolveProposalResult,
) {
  queryClient.setQueryData<ChatData>(chatKeys.conversation(), (prev) => {
    if (!prev) return prev;
    const updated = updateAllPages(prev, (msgs) =>
      msgs.map((m) => (m.id === result.proposal.id ? result.proposal : m)),
    );
    // Al confirmar no hay followUp (la tarjeta ya comunica el exito); al
    // cancelar si llega un mensaje de cierre.
    const followUp = result.followUp;
    return followUp
      ? updateFirstPage(updated, (msgs) => [...msgs, followUp])
      : updated;
  });
  invalidateOnTransactionCreated(queryClient, result.actionsTaken);
}

function invalidateOnTransactionCreated(
  queryClient: QueryClient,
  actions: ChatActionTaken[],
) {
  const createdTx = actions.some((a) => a.type === "create_transaction");
  if (createdTx) {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: accountKeys.all });
  }
}
