import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';

export type ChatChannel = 'in_app' | 'whatsapp';

@Entity('chat_conversations')
@Index(['userId', 'channel'], { unique: true })
export class ChatConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 16, default: 'in_app' })
  channel: ChatChannel;

  @OneToMany(() => ChatMessage, (msg) => msg.conversation)
  messages: ChatMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
