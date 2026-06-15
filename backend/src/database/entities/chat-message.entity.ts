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
export type ChatMessageKind = 'text' | 'proposal';
export type ChatMessageStatus = 'pending' | 'confirmed' | 'cancelled';

@Entity('chat_messages')
@Index(['conversationId', 'id'])
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

  @Column({ type: 'varchar', length: 16, default: 'text' })
  kind: ChatMessageKind;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  status: ChatMessageStatus | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
