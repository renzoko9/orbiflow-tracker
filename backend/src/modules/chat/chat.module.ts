import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatConversation, ChatMessage } from '@Entities';
import {
  ChatConversationRepository,
  ChatMessageRepository,
  UserRepository,
} from '@Repositories';
import { AIModule } from '../ai/ai.module';
import { AccountsModule } from '../accounts/accounts.module';
import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMapper } from './chat.mapper';
import { ChatToolsService } from './services/chat-tools.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatConversation, ChatMessage]),
    AIModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatToolsService,
    ChatMapper,
    ChatConversationRepository,
    ChatMessageRepository,
    UserRepository,
  ],
})
export class ChatModule {}
