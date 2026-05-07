import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIInsight } from '@Entities';
import { AIInsightRepository } from '@Repositories';
import { TransactionsModule } from '../transactions/transactions.module';
import { InsightsController } from './controllers/insights.controller';
import { InsightsService } from './services/insights.service';
import { AnthropicProvider } from './providers/anthropic.provider';
import { LLM_PROVIDER } from './providers/llm.provider';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AIInsight]),
    TransactionsModule,
  ],
  controllers: [InsightsController],
  providers: [
    InsightsService,
    AIInsightRepository,
    AnthropicProvider,
    {
      provide: LLM_PROVIDER,
      useExisting: AnthropicProvider,
    },
  ],
})
export class AIModule {}
