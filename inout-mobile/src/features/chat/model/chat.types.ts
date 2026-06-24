export type ChatMessageRole = "user" | "assistant";
export type ChatMessageKind = "text" | "proposal";
export type ChatMessageStatus = "pending" | "confirmed" | "cancelled";

export interface ChatProposalPayload {
  amount: number;
  type: 1 | 2;
  description: string;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  date: string;
  photos: string[];
  transactionId?: number;
}

export interface ChatMessage {
  id: number;
  role: ChatMessageRole;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  kind: ChatMessageKind;
  payload: ChatProposalPayload | null;
  status: ChatMessageStatus | null;
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

export interface ResolveProposalResult {
  proposal: ChatMessage;
  followUp: ChatMessage | null;
  actionsTaken: ChatActionTaken[];
}

export interface ConversationPage {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor: number | null;
}

export interface SendMessageInput {
  content?: string;
  imageUri?: string;
  imageMimeType?: string;
  imageFileName?: string;
}
