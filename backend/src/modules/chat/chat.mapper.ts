import { Injectable } from '@nestjs/common';
import { ChatMessage } from '@Entities';
import { ChatMessageResponse } from './models/chat-response.model';

@Injectable()
export class ChatMapper {
  toResponse(message: ChatMessage): ChatMessageResponse {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      imageUrl: message.imageUrl,
      createdAt:
        message.createdAt instanceof Date
          ? message.createdAt.toISOString()
          : String(message.createdAt),
    };
  }
}
