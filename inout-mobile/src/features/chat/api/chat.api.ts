import { httpClient } from "@/shared/api";
import type {
  Conversation,
  SendMessageInput,
  SendMessageResult,
} from "../model";

const PATHS = {
  conversation: "/chat/conversation",
  messages: "/chat/messages",
} as const;

export async function getConversation(): Promise<Conversation> {
  const { data } = await httpClient.get<Conversation>(PATHS.conversation);
  return data;
}

export async function deleteConversation(): Promise<void> {
  await httpClient.delete(PATHS.conversation);
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<SendMessageResult> {
  const form = new FormData();
  if (input.content) {
    form.append("content", input.content);
  }
  if (input.imageUri) {
    form.append("image", {
      uri: input.imageUri,
      name: input.imageFileName ?? "chat-image.jpg",
      type: input.imageMimeType ?? "image/jpeg",
    } as unknown as Blob);
  }

  const { data } = await httpClient.post<SendMessageResult>(
    PATHS.messages,
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}
