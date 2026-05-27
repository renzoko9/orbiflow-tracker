import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { accountKeys } from "@/features/accounts";
import { transactionKeys } from "@/features/transactions";
import * as chatApi from "./chat.api";
import { chatKeys } from "./chat.keys";
import type {
  ChatActionTaken,
  ChatMessage,
  Conversation,
  ResolveProposalResult,
  SendMessageInput,
  SendMessageResult,
} from "../model";

export function useConversation() {
  return useQuery({
    queryKey: chatKeys.conversation(),
    queryFn: chatApi.getConversation,
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
      queryClient.setQueryData<Conversation>(
        chatKeys.conversation(),
        (prev) => {
          const previousMessages: ChatMessage[] = (prev?.messages ?? []).map(
            (m) =>
              m.kind === "proposal" && m.status === "pending"
                ? { ...m, status: "cancelled" }
                : m,
          );
          return { messages: [...previousMessages, tempMessage] };
        },
      );
      return { tempId };
    },
    onError: (_err, _input, context) => {
      if (!context) return;
      queryClient.setQueryData<Conversation>(
        chatKeys.conversation(),
        (prev) => {
          if (!prev) return prev;
          return {
            messages: prev.messages.filter((m) => m.id !== context.tempId),
          };
        },
      );
    },
    onSuccess: (result, _input, context) => {
      queryClient.setQueryData<Conversation>(
        chatKeys.conversation(),
        (prev) => {
          const previousMessages = prev?.messages ?? [];
          const replaced = previousMessages.map((m) =>
            m.id === context?.tempId
              ? { ...result.userMessage, id: m.id }
              : m,
          );
          return { messages: [...replaced, result.assistantMessage] };
        },
      );

      invalidateOnTransactionCreated(queryClient, result.actionsTaken);
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: () => {
      queryClient.setQueryData<Conversation>(chatKeys.conversation(), {
        messages: [],
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
  queryClient.setQueryData<Conversation>(chatKeys.conversation(), (prev) => {
    const previousMessages = prev?.messages ?? [];
    const updated = previousMessages.map((m) =>
      m.id === result.proposal.id ? result.proposal : m,
    );
    return { messages: [...updated, result.followUp] };
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
