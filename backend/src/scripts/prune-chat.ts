import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ChatRetentionService } from '../modules/chat/services/chat-retention.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const service = app.get(ChatRetentionService);
  const result = await service.pruneOldMessages();
  console.log(
    `Listo. Mensajes: ${result.deletedMessages}. Objetos R2: ${result.deletedObjects}.`,
  );
  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
