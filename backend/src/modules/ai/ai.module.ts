import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIInsight } from '@Entities';
import { AIInsightRepository } from '@Repositories';
import { TransactionsModule } from '../transactions/transactions.module';
import { AccountsModule } from '../accounts/accounts.module';
import { InsightsController } from './controllers/insights.controller';
import { InsightsService } from './services/insights.service';
import { AnthropicProvider } from './providers/anthropic.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { LLM_PROVIDER } from './providers/llm.provider';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AIInsight]),
    TransactionsModule,
    AccountsModule,
  ],
  controllers: [InsightsController],
  providers: [
    InsightsService,
    AIInsightRepository,
    AnthropicProvider,
    OpenAIProvider,
    // Switch manual de proveedor: cambia el useExisting de abajo
    // { provide: LLM_PROVIDER, useExisting: AnthropicProvider },
    { provide: LLM_PROVIDER, useExisting: OpenAIProvider },
  ],
  exports: [LLM_PROVIDER],
})
export class AIModule {}
