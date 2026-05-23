export interface ChatMessageResponse {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  imageUrl: string | null;
  createdAt: string;
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
}
