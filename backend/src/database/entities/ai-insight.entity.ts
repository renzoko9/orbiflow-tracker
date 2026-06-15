import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export interface InsightContent {
  title: string;
  description: string;
}

@Entity('ai_insights')
@Index(['userId', 'type', 'period', 'dataFingerprint'])
export class AIInsight {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 7 })
  period: string;

  @Column({
    name: 'data_fingerprint',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  dataFingerprint: string | null;

  @Column({ type: 'jsonb' })
  content: InsightContent;

  @Column({ name: 'input_tokens', type: 'int', default: 0 })
  inputTokens: number;

  @Column({ name: 'output_tokens', type: 'int', default: 0 })
  outputTokens: number;

  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;
}
