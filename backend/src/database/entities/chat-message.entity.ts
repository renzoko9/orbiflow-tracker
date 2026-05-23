import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatConversation } from './chat-conversation.entity';

export type ChatMessageRole = 'user' | 'assistant';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => ChatConversation, (conv) => conv.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: ChatConversation;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({ type: 'varchar', length: 16 })
  role: ChatMessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'image_url', type: 'varchar', length: 512, nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
