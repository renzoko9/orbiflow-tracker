export type ChatMessageRole = "user" | "assistant";

export interface ChatMessage {
  id: number;
  role: ChatMessageRole;
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface ChatActionTaken {
  type: "create_transaction";
  transactionId: number;
}

export interface SendMessageResult {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  actionsTaken: ChatActionTaken[];
}

export interface Conversation {
  messages: ChatMessage[];
}

export interface SendMessageInput {
  content?: string;
  imageUri?: string;
  imageMimeType?: string;
  imageFileName?: string;
}
