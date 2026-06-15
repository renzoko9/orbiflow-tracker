export type ChatMessageKind = 'text' | 'proposal';
export type ChatMessageStatus = 'pending' | 'confirmed' | 'cancelled';

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

export interface ChatMessageResponse {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  imageUrl: string | null;
  createdAt: string;
  kind: ChatMessageKind;
  payload: ChatProposalPayload | null;
  status: ChatMessageStatus | null;
}

export interface ChatActionTaken {
  type: 'create_transaction';
  transactionId: number;
}

export interface SendMessageResponse {
  userMessage: ChatMessageResponse;
  assistantMessage: ChatMessageResponse;
  actionsTaken: ChatActionTaken[];
}

export interface ConversationResponse {
  messages: ChatMessageResponse[];
  hasMore: boolean;
  nextCursor: number | null;
}

export interface ResolveProposalResponse {
  proposal: ChatMessageResponse;
  followUp: ChatMessageResponse;
  actionsTaken: ChatActionTaken[];
}
