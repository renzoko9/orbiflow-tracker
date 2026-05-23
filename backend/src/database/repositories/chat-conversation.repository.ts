import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChatConversation } from '../entities/chat-conversation.entity';

@Injectable()
export class ChatConversationRepository extends Repository<ChatConversation> {
  constructor(private dataSource: DataSource) {
    super(ChatConversation, dataSource.createEntityManager());
  }
}
