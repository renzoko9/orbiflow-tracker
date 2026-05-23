import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountKeys } from "@/features/accounts";
import { transactionKeys } from "@/features/transactions";
import * as chatApi from "./chat.api";
import { chatKeys } from "./chat.keys";
import type {
  ChatMessage,
  Conversation,
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
  return useMutation<SendMessageResult, Error, SendMessageInput>({
    mutationFn: chatApi.sendMessage,
    onSuccess: (result) => {
      queryClient.setQueryData<Conversation>(
        chatKeys.conversation(),
        (prev) => {
          const previousMessages: ChatMessage[] = prev?.messages ?? [];
          return {
            messages: [
              ...previousMessages,
              result.userMessage,
              result.assistantMessage,
            ],
          };
        },
      );

      const createdTx = result.actionsTaken.some(
        (a) => a.type === "create_transaction",
      );
      if (createdTx) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.all });
        queryClient.invalidateQueries({ queryKey: accountKeys.all });
      }
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
