import { Inject, Injectable, Logger } from '@nestjs/common';
import { Between } from 'typeorm';
import { AIInsight, InsightContent } from '@Entities';
import { AIInsightRepository, TransactionRepository } from '@Repositories';
import { CategoryTypeEnum } from '@Enums';
import { LLM_PROVIDER } from '../providers/llm.provider';
import type { LLMProvider } from '../providers/llm.provider';
import { MonthlyInsightResponse } from '../dto/insight-response.dto';

interface MonthlyData {
  period: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactionCount: number;
  topCategories: { name: string; amount: number; type: CategoryTypeEnum }[];
}

const INSIGHT_TOOL = {
  name: 'emit_insight',
  description:
    'Emite un insight financiero estructurado para mostrar al usuario.',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Título corto del insight (máx 60 caracteres).',
      },
      description: {
        type: 'string',
        description:
          'Descripción narrativa de 1 a 2 oraciones. Tono cercano y motivador.',
      },
      bullets: {
        type: 'array',
        items: { type: 'string' },
        description:
          'De 2 a 4 puntos clave concretos basados en los datos. Cada uno máx 80 caracteres.',
      },
    },
    required: ['title', 'description', 'bullets'],
  },
};

const CACHE_TTL_HOURS = 6;

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LLMProvider,
    private readonly aiInsightRepo: AIInsightRepository,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  async getMonthlyInsight(userId: number): Promise<MonthlyInsightResponse> {
    const period = this.currentPeriod();

    const cached = await this.aiInsightRepo.findOne({
      where: { userId, type: 'monthly_summary', period },
      order: { generatedAt: 'DESC' },
    });

    if (cached && this.isFresh(cached.generatedAt)) {
      return this.toResponse(cached, period, true);
    }

    const data = await this.aggregateMonthly(userId, period);

    if (data.transactionCount === 0) {
      return {
        available: true,
        title: 'Sin movimientos este mes',
        description:
          'Aún no registras ingresos ni gastos. Empieza agregando tus primeras transacciones para ver análisis personalizados.',
        bullets: [],
        period,
        generatedAt: new Date(),
        cached: false,
      };
    }

    try {
      const llmResponse = await this.llm.generate({
        systemPrompt: this.buildSystemPrompt(),
        userPrompt: this.buildUserPrompt(data),
        tools: [INSIGHT_TOOL],
        toolChoice: { type: 'tool', name: 'emit_insight' },
        maxTokens: 800,
      });

      if (!llmResponse.toolUse) {
        throw new Error('LLM no devolvió tool_use');
      }

      const content = llmResponse.toolUse.input as unknown as InsightContent;

      const saved = await this.aiInsightRepo.save({
        userId,
        type: 'monthly_summary',
        period,
        content,
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
      });

      this.logger.log(
        `Insight mensual generado para usuario ${userId} (${period}). Tokens: ${llmResponse.usage.inputTokens}/${llmResponse.usage.outputTokens}`,
      );

      return this.toResponse(saved, period, false);
    } catch (error) {
      this.logger.error(
        `Error generando insight para usuario ${userId}: ${(error as Error).message}`,
      );

      if (cached) {
        return this.toResponse(cached, period, true);
      }

      return {
        available: false,
        title: '',
        description: '',
        bullets: [],
        period,
        generatedAt: new Date(),
        cached: false,
      };
    }
  }

  private toResponse(
    insight: AIInsight,
    period: string,
    cached: boolean,
  ): MonthlyInsightResponse {
    return {
      available: true,
      title: insight.content.title,
      description: insight.content.description,
      bullets: insight.content.bullets,
      period,
      generatedAt: insight.generatedAt,
      cached,
    };
  }

  private isFresh(generatedAt: Date): boolean {
    const ageMs = Date.now() - new Date(generatedAt).getTime();
    return ageMs < CACHE_TTL_HOURS * 60 * 60 * 1000;
  }

  private currentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private async aggregateMonthly(
    userId: number,
    period: string,
  ): Promise<MonthlyData> {
    const [year, month] = period.split('-').map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await this.transactionRepo.find({
      where: { user: { id: userId }, date: Between(start, end) },
      relations: ['category'],
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = new Map<
      string,
      { amount: number; type: CategoryTypeEnum }
    >();

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (tx.type === CategoryTypeEnum.Income) {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }

      const catName = tx.category?.name ?? 'Sin categoría';
      const existing = byCategory.get(catName);
      byCategory.set(catName, {
        amount: (existing?.amount ?? 0) + amount,
        type: tx.type,
      });
    }

    const topCategories = Array.from(byCategory.entries())
      .map(([name, v]) => ({ name, amount: v.amount, type: v.type }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      period,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      transactionCount: transactions.length,
      topCategories,
    };
  }

  private buildSystemPrompt(): string {
    return [
      'Eres un asistente financiero personal que genera insights breves y útiles para usuarios de una app de finanzas personales.',
      'Tu tono es cercano, motivador y nunca culpabilizador.',
      'Hablas siempre en español neutro.',
      'No inventes números: usa solo los datos que te pasa el usuario.',
      'Evita consejos genéricos. Sé específico sobre los datos del mes.',
      'Si los gastos superan los ingresos, sugiere acción concreta sin alarmismo.',
      'Si hay superávit, reconócelo y sugiere qué hacer con él.',
      'Devuelve siempre el resultado vía la tool emit_insight.',
    ].join(' ');
  }

  private buildUserPrompt(data: MonthlyData): string {
    const cats = data.topCategories
      .map(
        (c) =>
          `- ${c.name} (${c.type === CategoryTypeEnum.Income ? 'ingreso' : 'gasto'}): ${c.amount.toFixed(2)}`,
      )
      .join('\n');

    return [
      `Datos del mes ${data.period}:`,
      `- Ingresos totales: ${data.totalIncome.toFixed(2)}`,
      `- Gastos totales: ${data.totalExpense.toFixed(2)}`,
      `- Balance neto: ${data.net.toFixed(2)}`,
      `- Cantidad de transacciones: ${data.transactionCount}`,
      '',
      'Top categorías por monto:',
      cats,
      '',
      'Genera un insight mensual usando emit_insight.',
    ].join('\n');
  }
}
