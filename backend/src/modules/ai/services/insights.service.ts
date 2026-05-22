import { Inject, Injectable, Logger } from '@nestjs/common';
import { Between, IsNull } from 'typeorm';
import { createHash } from 'crypto';
import { AIInsight, InsightContent } from '@Entities';
import {
  AIInsightRepository,
  AccountRepository,
  TransactionRepository,
} from '@Repositories';
import { TransactionTypeEnum } from '@Enums';
import { LLM_PROVIDER } from '../providers/llm.provider';
import type { LLMProvider } from '../providers/llm.provider';
import { InsightResponse } from '../dto/insight-response.dto';

interface MonthlyData {
  period: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  transactionCount: number;
  daysElapsed: number;
  daysInMonth: number;
  daysRemaining: number;
  projectedIncome: number;
  projectedExpense: number;
  projectedNet: number;
  previousMonth: {
    totalIncome: number;
    totalExpense: number;
    net: number;
  } | null;
  topCategories: { name: string; amount: number; type: TransactionTypeEnum }[];
  categoryDeltas: {
    name: string;
    type: TransactionTypeEnum;
    current: number;
    previous: number;
    deltaAmount: number;
    deltaPercent: number;
  }[];
  weekdayExpense: number;
  weekendExpense: number;
  weekdayTransactionCount: number;
  weekendTransactionCount: number;
}

interface AccountsData {
  totalWealth: number;
  previousMonthTotalWealth: number;
  wealthDelta: number;
  wealthDeltaPercent: number;
  accounts: {
    name: string;
    balance: number;
    percentage: number;
    daysSinceLastTransaction: number | null;
    isActive: boolean;
  }[];
  topConcentrationPercent: number;
  activeCount: number;
  inactiveCount: number;
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
        description: 'Titulo corto del insight (max 60 caracteres).',
      },
      description: {
        type: 'string',
        description:
          'Descripcion narrativa de 2 a 3 oraciones. Incluye los numeros concretos relevantes (montos, porcentajes) directamente en el texto. Tono cercano y motivador.',
      },
    },
    required: ['title', 'description'],
  },
};

const ACTIVE_DAYS_THRESHOLD = 30;

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    @Inject(LLM_PROVIDER) private readonly llm: LLMProvider,
    private readonly aiInsightRepo: AIInsightRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly accountRepo: AccountRepository,
  ) {}

  async getMonthlyInsight(userId: number): Promise<InsightResponse> {
    const period = this.currentPeriod();
    const data = await this.aggregateMonthly(userId, period);

    if (data.transactionCount === 0) {
      return this.emptyResponse(period, {
        title: 'Sin movimientos este mes',
        description:
          'Aun no registras ingresos ni gastos. Empieza agregando tus primeras transacciones para ver analisis personalizados.',
      });
    }

    return this.getOrGenerate({
      userId,
      type: 'monthly_summary',
      period,
      fingerprint: this.computeMonthlyFingerprint(data),
      systemPrompt: this.buildMonthlySystemPrompt(),
      userPrompt: this.buildMonthlyUserPrompt(data),
    });
  }

  async getAccountsInsight(userId: number): Promise<InsightResponse> {
    const period = this.currentPeriod();
    const data = await this.aggregateAccounts(userId);

    if (data.accounts.length === 0) {
      return this.emptyResponse(period, {
        title: 'Sin cuentas registradas',
        description:
          'Aun no creaste cuentas. Agrega al menos una para ver analisis sobre tu distribucion de dinero.',
      });
    }

    return this.getOrGenerate({
      userId,
      type: 'accounts_distribution',
      period,
      fingerprint: this.computeAccountsFingerprint(data),
      systemPrompt: this.buildAccountsSystemPrompt(),
      userPrompt: this.buildAccountsUserPrompt(data),
    });
  }

  private async getOrGenerate(params: {
    userId: number;
    type: string;
    period: string;
    fingerprint: string;
    systemPrompt: string;
    userPrompt: string;
  }): Promise<InsightResponse> {
    const { userId, type, period, fingerprint, systemPrompt, userPrompt } =
      params;

    const cached = await this.aiInsightRepo.findOne({
      where: { userId, type, period, dataFingerprint: fingerprint },
    });

    if (cached) {
      return this.toResponse(cached, period, true);
    }

    try {
      const llmResponse = await this.llm.generate({
        systemPrompt,
        userPrompt,
        tools: [INSIGHT_TOOL],
        toolChoice: { type: 'tool', name: 'emit_insight' },
        maxTokens: 800,
      });

      if (!llmResponse.toolUse) {
        throw new Error('LLM no devolvio tool_use');
      }

      const content = llmResponse.toolUse.input as unknown as InsightContent;

      const saved = await this.aiInsightRepo.save({
        userId,
        type,
        period,
        dataFingerprint: fingerprint,
        content,
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
      });

      this.logger.log(
        `Insight ${type} generado para usuario ${userId} (${period}). Tokens: ${llmResponse.usage.inputTokens}/${llmResponse.usage.outputTokens}`,
      );

      return this.toResponse(saved, period, false);
    } catch (error) {
      this.logger.error(
        `Error generando insight ${type} para usuario ${userId}: ${(error as Error).message}`,
      );

      const latest = await this.aiInsightRepo.findOne({
        where: { userId, type, period },
        order: { generatedAt: 'DESC' },
      });
      if (latest) {
        return this.toResponse(latest, period, true);
      }

      return {
        available: false,
        title: '',
        description: '',
        period,
        generatedAt: new Date(),
        cached: false,
      };
    }
  }

  private emptyResponse(
    period: string,
    content: { title: string; description: string },
  ): InsightResponse {
    return {
      available: true,
      title: content.title,
      description: content.description,
      period,
      generatedAt: new Date(),
      cached: false,
    };
  }

  private toResponse(
    insight: AIInsight,
    period: string,
    cached: boolean,
  ): InsightResponse {
    return {
      available: true,
      title: insight.content.title,
      description: insight.content.description,
      period,
      generatedAt: insight.generatedAt,
      cached,
    };
  }

  private computeMonthlyFingerprint(data: MonthlyData): string {
    const cats = [...data.topCategories]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => `${c.name}:${c.amount.toFixed(2)}`)
      .join(',');
    const prev = data.previousMonth
      ? `${data.previousMonth.totalIncome.toFixed(2)}|${data.previousMonth.totalExpense.toFixed(2)}`
      : 'none';
    const parts = [
      `period=${data.period}`,
      `dayMTD=${data.daysElapsed}`,
      `txCount=${data.transactionCount}`,
      `inc=${data.totalIncome.toFixed(2)}`,
      `exp=${data.totalExpense.toFixed(2)}`,
      `prev=${prev}`,
      `cats=${cats}`,
      `wd=${data.weekdayExpense.toFixed(2)}|${data.weekdayTransactionCount}`,
      `we=${data.weekendExpense.toFixed(2)}|${data.weekendTransactionCount}`,
    ];
    return createHash('sha256').update(parts.join('||')).digest('hex');
  }

  private computeAccountsFingerprint(data: AccountsData): string {
    const accountsPart = [...data.accounts]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => `${a.name}:${a.balance.toFixed(2)}:${a.isActive ? '1' : '0'}`)
      .join(',');
    const parts = [
      `total=${data.totalWealth.toFixed(2)}`,
      `prev=${data.previousMonthTotalWealth.toFixed(2)}`,
      `active=${data.activeCount}|${data.inactiveCount}`,
      `accounts=${accountsPart}`,
    ];
    return createHash('sha256').update(parts.join('||')).digest('hex');
  }

  private currentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private periodRange(period: string): { start: Date; end: Date } {
    const [year, month] = period.split('-').map(Number);
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59),
    };
  }

  private previousPeriod(period: string): string {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private async aggregateMonthly(
    userId: number,
    period: string,
  ): Promise<MonthlyData> {
    const { start, end } = this.periodRange(period);
    const now = new Date();
    const daysInMonth = end.getDate();
    const daysElapsed = Math.min(
      now.getMonth() === start.getMonth() &&
        now.getFullYear() === start.getFullYear()
        ? now.getDate()
        : daysInMonth,
      daysInMonth,
    );
    const daysRemaining = daysInMonth - daysElapsed;

    const transactions = await this.transactionRepo.find({
      where: {
        user: { id: userId },
        date: Between(start, end),
        transferGroupId: IsNull(),
      },
      relations: ['category'],
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let weekdayExpense = 0;
    let weekendExpense = 0;
    let weekdayCount = 0;
    let weekendCount = 0;
    const byCategory = new Map<
      string,
      { amount: number; type: TransactionTypeEnum }
    >();

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      const isExpense = tx.type === TransactionTypeEnum.Expense;
      if (isExpense) totalExpense += amount;
      else totalIncome += amount;

      const txDate = new Date(tx.date);
      const dayOfWeek = txDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isExpense) {
        if (isWeekend) {
          weekendExpense += amount;
          weekendCount += 1;
        } else {
          weekdayExpense += amount;
          weekdayCount += 1;
        }
      }

      const catName = tx.category?.name ?? 'Sin categoria';
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

    const previousData = await this.aggregatePreviousMonth(userId, period);

    const categoryDeltas = this.computeCategoryDeltas(
      byCategory,
      previousData?.byCategory ?? new Map(),
    );

    const projectionFactor = daysElapsed > 0 ? daysInMonth / daysElapsed : 1;
    const projectedIncome = totalIncome * projectionFactor;
    const projectedExpense = totalExpense * projectionFactor;

    return {
      period,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      transactionCount: transactions.length,
      daysElapsed,
      daysInMonth,
      daysRemaining,
      projectedIncome,
      projectedExpense,
      projectedNet: projectedIncome - projectedExpense,
      previousMonth: previousData
        ? {
            totalIncome: previousData.totalIncome,
            totalExpense: previousData.totalExpense,
            net: previousData.totalIncome - previousData.totalExpense,
          }
        : null,
      topCategories,
      categoryDeltas,
      weekdayExpense,
      weekendExpense,
      weekdayTransactionCount: weekdayCount,
      weekendTransactionCount: weekendCount,
    };
  }

  private async aggregatePreviousMonth(
    userId: number,
    currentPeriod: string,
  ): Promise<{
    totalIncome: number;
    totalExpense: number;
    byCategory: Map<string, { amount: number; type: TransactionTypeEnum }>;
  } | null> {
    const prevPeriod = this.previousPeriod(currentPeriod);
    const { start, end } = this.periodRange(prevPeriod);

    const transactions = await this.transactionRepo.find({
      where: {
        user: { id: userId },
        date: Between(start, end),
        transferGroupId: IsNull(),
      },
      relations: ['category'],
    });

    if (transactions.length === 0) return null;

    let totalIncome = 0;
    let totalExpense = 0;
    const byCategory = new Map<
      string,
      { amount: number; type: TransactionTypeEnum }
    >();

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (tx.type === TransactionTypeEnum.Expense) totalExpense += amount;
      else totalIncome += amount;

      const catName = tx.category?.name ?? 'Sin categoria';
      const existing = byCategory.get(catName);
      byCategory.set(catName, {
        amount: (existing?.amount ?? 0) + amount,
        type: tx.type,
      });
    }

    return { totalIncome, totalExpense, byCategory };
  }

  private computeCategoryDeltas(
    current: Map<string, { amount: number; type: TransactionTypeEnum }>,
    previous: Map<string, { amount: number; type: TransactionTypeEnum }>,
  ): MonthlyData['categoryDeltas'] {
    const allNames = new Set([...current.keys(), ...previous.keys()]);
    const deltas: MonthlyData['categoryDeltas'] = [];

    for (const name of allNames) {
      const cur = current.get(name);
      const prev = previous.get(name);
      const curAmount = cur?.amount ?? 0;
      const prevAmount = prev?.amount ?? 0;
      const type = cur?.type ?? prev?.type ?? TransactionTypeEnum.Expense;
      const deltaAmount = curAmount - prevAmount;
      const deltaPercent =
        prevAmount > 0
          ? (deltaAmount / prevAmount) * 100
          : curAmount > 0
            ? 100
            : 0;

      deltas.push({
        name,
        type,
        current: curAmount,
        previous: prevAmount,
        deltaAmount,
        deltaPercent,
      });
    }

    return deltas
      .filter((d) => d.previous > 0 && Math.abs(d.deltaPercent) >= 15)
      .sort((a, b) => Math.abs(b.deltaPercent) - Math.abs(a.deltaPercent))
      .slice(0, 4);
  }

  private async aggregateAccounts(userId: number): Promise<AccountsData> {
    const accounts = await this.accountRepo.find({
      where: { user: { id: userId }, archivedAt: IsNull() },
    });

    if (accounts.length === 0) {
      return {
        totalWealth: 0,
        previousMonthTotalWealth: 0,
        wealthDelta: 0,
        wealthDeltaPercent: 0,
        accounts: [],
        topConcentrationPercent: 0,
        activeCount: 0,
        inactiveCount: 0,
      };
    }

    const period = this.currentPeriod();
    const { start, end } = this.periodRange(period);

    const monthTxs = await this.transactionRepo.find({
      where: {
        user: { id: userId },
        date: Between(start, end),
        transferGroupId: IsNull(),
      },
    });

    let monthIncome = 0;
    let monthExpense = 0;
    for (const tx of monthTxs) {
      const amount = Number(tx.amount);
      if (tx.type === TransactionTypeEnum.Expense) monthExpense += amount;
      else monthIncome += amount;
    }
    const monthNet = monthIncome - monthExpense;

    const lastTxByAccount = new Map<number, Date>();
    const allTxs = await this.transactionRepo.find({
      where: { user: { id: userId }, transferGroupId: IsNull() },
      order: { date: 'DESC' },
      relations: ['account'],
    });
    for (const tx of allTxs) {
      const accId = tx.account?.id;
      if (!accId) continue;
      if (!lastTxByAccount.has(accId)) {
        lastTxByAccount.set(accId, new Date(tx.date));
      }
    }

    const totalWealth = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const previousMonthTotalWealth = totalWealth - monthNet;

    const now = new Date();
    let activeCount = 0;
    let inactiveCount = 0;

    const accountSummaries = accounts
      .map((a) => {
        const balance = Number(a.balance);
        const percentage =
          totalWealth !== 0 ? (balance / totalWealth) * 100 : 0;
        const lastTx = lastTxByAccount.get(a.id);
        const daysSinceLastTransaction = lastTx
          ? Math.floor(
              (now.getTime() - lastTx.getTime()) / (1000 * 60 * 60 * 24),
            )
          : null;
        const isActive =
          daysSinceLastTransaction !== null &&
          daysSinceLastTransaction <= ACTIVE_DAYS_THRESHOLD;

        if (isActive) activeCount += 1;
        else inactiveCount += 1;

        return {
          name: a.name,
          balance,
          percentage,
          daysSinceLastTransaction,
          isActive,
        };
      })
      .sort((a, b) => b.balance - a.balance);

    const topConcentrationPercent = accountSummaries[0]?.percentage ?? 0;
    const wealthDelta = totalWealth - previousMonthTotalWealth;
    const wealthDeltaPercent =
      previousMonthTotalWealth !== 0
        ? (wealthDelta / Math.abs(previousMonthTotalWealth)) * 100
        : 0;

    return {
      totalWealth,
      previousMonthTotalWealth,
      wealthDelta,
      wealthDeltaPercent,
      accounts: accountSummaries,
      topConcentrationPercent,
      activeCount,
      inactiveCount,
    };
  }

  private buildMonthlySystemPrompt(): string {
    return [
      'Eres un asistente financiero personal que genera insights breves y utiles para el resumen mensual de un usuario.',
      'Tu tono es cercano, motivador y nunca culpabilizador. Hablas en espanol neutro.',
      'No inventes numeros: usa solo los que te paso.',
      'Eliges UNO de estos tres angulos para el insight, el que mas valor agregue segun los datos:',
      '1) FORECAST: si pasaron al menos 7 dias del mes, proyecta como va a cerrar el mes y compara con el mes anterior si hay data.',
      '2) CATEGORIA QUE CRECE: si una categoria tuvo una variacion fuerte (>= 20% absoluta) vs el mes anterior, destacala con numeros concretos.',
      '3) HABITO DE GASTO: si hay diferencia clara entre gasto promedio de fin de semana vs dias de semana, mencionala (calcula promedios por cantidad de transacciones, no por dia).',
      'Si los datos no soportan ningun angulo (mes muy chico, sin mes previo), haz un resumen cualitativo simple sin forecast ni comparativas.',
      'Devuelve siempre el resultado via la tool emit_insight con un title corto (max 60 caracteres) y una description de 1 a 2 oraciones que incluya los numeros concretos clave directamente en el texto. No uses listas ni bullets.',
    ].join(' ');
  }

  private buildMonthlyUserPrompt(data: MonthlyData): string {
    const lines: string[] = [];
    lines.push(`MES ACTUAL: ${data.period}`);
    lines.push(
      `Dias transcurridos: ${data.daysElapsed} de ${data.daysInMonth} (faltan ${data.daysRemaining})`,
    );
    lines.push(`Ingresos MTD: ${data.totalIncome.toFixed(2)}`);
    lines.push(`Gastos MTD: ${data.totalExpense.toFixed(2)}`);
    lines.push(`Balance neto MTD: ${data.net.toFixed(2)}`);
    lines.push(`Cantidad de transacciones: ${data.transactionCount}`);
    lines.push('');
    lines.push('PROYECCION LINEAL A FIN DE MES:');
    lines.push(`- Ingresos proyectados: ${data.projectedIncome.toFixed(2)}`);
    lines.push(`- Gastos proyectados: ${data.projectedExpense.toFixed(2)}`);
    lines.push(`- Balance proyectado: ${data.projectedNet.toFixed(2)}`);
    lines.push('');

    if (data.previousMonth) {
      lines.push('MES ANTERIOR (referencia):');
      lines.push(`- Ingresos: ${data.previousMonth.totalIncome.toFixed(2)}`);
      lines.push(`- Gastos: ${data.previousMonth.totalExpense.toFixed(2)}`);
      lines.push(`- Balance: ${data.previousMonth.net.toFixed(2)}`);
    } else {
      lines.push('MES ANTERIOR: sin datos (no hay transacciones).');
    }
    lines.push('');

    lines.push('TOP CATEGORIAS DEL MES (por monto):');
    for (const c of data.topCategories) {
      const tipo = c.type === TransactionTypeEnum.Income ? 'ingreso' : 'gasto';
      lines.push(`- ${c.name} (${tipo}): ${c.amount.toFixed(2)}`);
    }
    lines.push('');

    if (data.categoryDeltas.length > 0) {
      lines.push('CATEGORIAS CON MAYOR VARIACION vs MES ANTERIOR:');
      for (const d of data.categoryDeltas) {
        const tipo =
          d.type === TransactionTypeEnum.Income ? 'ingreso' : 'gasto';
        const sign = d.deltaPercent >= 0 ? '+' : '';
        lines.push(
          `- ${d.name} (${tipo}): ${d.previous.toFixed(2)} -> ${d.current.toFixed(2)} (${sign}${d.deltaPercent.toFixed(0)}%)`,
        );
      }
    } else {
      lines.push('CATEGORIAS: sin variaciones significativas vs mes anterior.');
    }
    lines.push('');

    lines.push('HABITO DE GASTO (solo gastos):');
    lines.push(
      `- Dias de semana: total ${data.weekdayExpense.toFixed(2)} en ${data.weekdayTransactionCount} transacciones`,
    );
    lines.push(
      `- Fin de semana: total ${data.weekendExpense.toFixed(2)} en ${data.weekendTransactionCount} transacciones`,
    );
    lines.push('');
    lines.push('Genera el insight con emit_insight.');

    return lines.join('\n');
  }

  private buildAccountsSystemPrompt(): string {
    return [
      'Eres un asistente financiero personal que genera insights breves sobre la distribucion del dinero del usuario entre sus cuentas.',
      'Tu tono es cercano, motivador y nunca culpabilizador. Hablas en espanol neutro.',
      'No inventes numeros: usa solo los que te paso.',
      'Eliges UNO de estos tres angulos para el insight, el que mas valor agregue segun los datos:',
      '1) CONCENTRACION: si una cuenta concentra mas del 60% del patrimonio, sugiere distribuir hacia ahorro o inversion sin alarmismo.',
      '2) BALANCE ENTRE CUENTAS ACTIVAS: si la distribucion entre cuentas activas se ve saludable o desequilibrada, mencionalo con porcentajes concretos.',
      '3) TENDENCIA PATRIMONIAL: si el patrimonio total crecio o decrecio respecto al mes anterior, destacalo con monto y porcentaje.',
      'Si solo hay una cuenta, no hables de concentracion como problema: enfocate en tendencia o en sugerir diversificacion futura.',
      'Devuelve siempre el resultado via la tool emit_insight con un title corto (max 60 caracteres) y una description de 2 a 3 oraciones que incluya los numeros concretos clave directamente en el texto. No uses listas ni bullets.',
    ].join(' ');
  }

  private buildAccountsUserPrompt(data: AccountsData): string {
    const lines: string[] = [];
    lines.push(`PATRIMONIO TOTAL ACTUAL: ${data.totalWealth.toFixed(2)}`);
    lines.push(
      `Patrimonio estimado a inicio del mes: ${data.previousMonthTotalWealth.toFixed(2)}`,
    );
    const sign = data.wealthDelta >= 0 ? '+' : '';
    lines.push(
      `Variacion del mes: ${sign}${data.wealthDelta.toFixed(2)} (${sign}${data.wealthDeltaPercent.toFixed(1)}%)`,
    );
    lines.push('');
    lines.push(
      `Cuentas activas (con movimientos en los ultimos ${ACTIVE_DAYS_THRESHOLD} dias): ${data.activeCount}`,
    );
    lines.push(`Cuentas inactivas: ${data.inactiveCount}`);
    lines.push(
      `Concentracion en la cuenta mas grande: ${data.topConcentrationPercent.toFixed(1)}%`,
    );
    lines.push('');
    lines.push('DETALLE POR CUENTA (ordenadas por saldo):');
    for (const a of data.accounts) {
      const lastTx =
        a.daysSinceLastTransaction === null
          ? 'sin movimientos'
          : `ultima tx hace ${a.daysSinceLastTransaction} dias`;
      const status = a.isActive ? 'activa' : 'inactiva';
      lines.push(
        `- ${a.name}: ${a.balance.toFixed(2)} (${a.percentage.toFixed(1)}%, ${status}, ${lastTx})`,
      );
    }
    lines.push('');
    lines.push('Genera el insight con emit_insight.');

    return lines.join('\n');
  }
}
