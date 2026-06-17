import { Injectable } from '@nestjs/common';
import { ChatMessage } from '@Entities';
import {
  ChatMessageResponse,
  ChatProposalPayload,
} from './models/chat-response.model';
import { StorageService } from '@/common/providers/storage/storage.service';

@Injectable()
export class ChatMapper {
  constructor(private readonly storage: StorageService) {}

  async toResponse(message: ChatMessage): Promise<ChatMessageResponse> {
    const payload = (message.payload as ChatProposalPayload | null) ?? null;
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      imageUrl: await this.storage.signOrNull(message.imageUrl),
      kind: message.kind,
      payload: payload
        ? {
            ...payload,
            photos: await this.storage.signMany(payload.photos ?? []),
          }
        : null,
      status: message.status,
      createdAt:
        message.createdAt instanceof Date
          ? message.createdAt.toISOString()
          : String(message.createdAt),
    };
  }
}
