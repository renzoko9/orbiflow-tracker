import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import {
  ChatMessageRepository,
  TransactionRepository,
} from '@Repositories';
import { StorageService } from '@/common/providers/storage/storage.service';

const DEFAULT_RETENTION_DAYS = 90;
const CHAT_KEY_PREFIX = 'chat/';

@Injectable()
export class ChatRetentionService {
  private readonly logger = new Logger(ChatRetentionService.name);
  private readonly retentionDays: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly messageRepo: ChatMessageRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly storage: StorageService,
  ) {
    this.retentionDays = Number(
      this.configService.get<string>('CHAT_RETENTION_DAYS') ??
        DEFAULT_RETENTION_DAYS,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    await this.pruneOldMessages();
  }

  // Borra mensajes de chat mas viejos que la ventana de retencion y sus
  // imagenes en R2. Solo borra el objeto R2 si ninguna transaccion lo
  // referencia (una key chat/ puede compartirse con transaction.photos cuando
  // se confirma una propuesta).
  async pruneOldMessages(): Promise<{
    deletedMessages: number;
    deletedObjects: number;
  }> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.retentionDays);

    const oldMessages = await this.messageRepo.find({
      where: { createdAt: LessThan(cutoff) },
    });
    if (oldMessages.length === 0) {
      this.logger.log('Pruning de chat: no hay mensajes para purgar.');
      return { deletedMessages: 0, deletedObjects: 0 };
    }

    const candidateKeys = new Set<string>();
    for (const message of oldMessages) {
      if (message.imageUrl) candidateKeys.add(message.imageUrl);
      const payload = message.payload as { photos?: string[] } | null;
      if (payload && Array.isArray(payload.photos)) {
        for (const photo of payload.photos) candidateKeys.add(photo);
      }
    }

    let deletedObjects = 0;
    for (const key of candidateKeys) {
      if (!key.startsWith(CHAT_KEY_PREFIX)) continue;
      if (await this.isReferencedByTransaction(key)) continue;
      await this.storage.delete(key);
      deletedObjects++;
    }

    await this.messageRepo.delete(oldMessages.map((m) => m.id));

    const cutoffDay = cutoff.toISOString().split('T')[0];
    this.logger.log(
      `Pruning de chat: ${oldMessages.length} mensajes y ${deletedObjects} objetos R2 eliminados (cutoff ${cutoffDay}).`,
    );
    return { deletedMessages: oldMessages.length, deletedObjects };
  }

  private async isReferencedByTransaction(key: string): Promise<boolean> {
    const count = await this.transactionRepo
      .createQueryBuilder('t')
      .where(':key = ANY(t.photos)', { key })
      .getCount();
    return count > 0;
  }
}
