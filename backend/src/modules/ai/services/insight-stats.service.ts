import { Injectable } from '@nestjs/common';
import { Between, IsNull } from 'typeorm';
import { Transaction } from '@Entities';
import { TransactionRepository } from '@Repositories';
import { TransactionTypeEnum } from '@Enums';
import {
  CategoryStat,
  InsightStatsResponse,
  PeriodSummary,
  PreviousPeriod,
  TrendPoint,
} from '../dto/insight-stats.dto';
import { InsightStatsQuery } from '../dto/insight-stats.query';

const TREND_MONTHS = 6;
const MONTH_LABELS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface CategoryAccumulator {
  name: string;
  color: string;
  icon: string | null;
  amount: number;
  count: number;
}

@Injectable()
export class InsightStatsService {
  constructor(private readonly transactionRepo: TransactionRepository) {}

  async getStats(
    userId: number,
    query: InsightStatsQuery = {},
  ): Promise<InsightStatsResponse> {
    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? null;
    const granularity = month ? 'month' : 'year';

    const periodKeys = this.periodKeys(year, month);
    const previousKeys = this.previousPeriodKeys(year, month);

    const trendPeriods = month
      ? this.lastMonthKeys(year, month, TREND_MONTHS)
      : this.yearMonthKeys(year);

    // Ventana que cubre el periodo, el periodo anterior y la tendencia.
    const allKeys = [...periodKeys, ...previousKeys, ...trendPeriods];
    const queryStart = this.startOfKey(
      allKeys.reduce((a, b) => (a < b ? a : b)),
    );
    const queryEnd = this.endOfKey(
      periodKeys.reduce((a, b) => (a > b ? a : b)),
    );

    const transactions = await this.transactionRepo.find({
      where: {
        user: { id: userId },
        date: Between(queryStart, queryEnd),
        transferGroupId: IsNull(),
      },
      relations: ['category'],
    });

    const periodSet = new Set(periodKeys);
    const previousSet = new Set(previousKeys);
    const periodTxs = transactions.filter((tx) =>
      periodSet.has(this.keyOf(tx.date)),
    );
    const previousTxs = transactions.filter((tx) =>
      previousSet.has(this.keyOf(tx.date)),
    );

    const summary = this.buildSummary(periodTxs);
    const previousSummary = this.buildSummary(previousTxs);

    const earliest = await this.transactionRepo.findOne({
      where: { user: { id: userId } },
      order: { date: 'ASC' },
    });
    const availableYears = this.buildAvailableYears(earliest, year, now);

    const isCurrentPeriod = month
      ? year === now.getFullYear() && month === now.getMonth() + 1
      : year === now.getFullYear();

    let daysElapsed: number | null = null;
    let daysInMonth: number | null = null;
    let projection: InsightStatsResponse['projection'] = null;
    if (month && isCurrentPeriod) {
      daysInMonth = new Date(year, month, 0).getDate();
      daysElapsed = Math.min(now.getDate(), daysInMonth);
      const factor = daysElapsed > 0 ? daysInMonth / daysElapsed : 1;
      const projectedIncome = summary.income * factor;
      const projectedExpense = summary.expense * factor;
      projection = {
        income: projectedIncome,
        expense: projectedExpense,
        net: projectedIncome - projectedExpense,
      };
    }

    return {
      year,
      month,
      granularity,
      label: month ? `${MONTH_NAMES[month - 1]} ${year}` : `${year}`,
      hasData: periodTxs.length > 0,
      hasHistory: earliest !== null,
      isCurrentPeriod,
      daysElapsed,
      daysInMonth,
      summary,
      previous: this.buildPrevious(
        summary,
        previousSummary,
        previousTxs,
        year,
        month,
      ),
      projection,
      trend: this.buildTrend(transactions, trendPeriods),
      expenseCategories: this.buildCategories(
        periodTxs,
        previousTxs,
        TransactionTypeEnum.Expense,
        summary.expense,
      ),
      incomeCategories: this.buildCategories(
        periodTxs,
        previousTxs,
        TransactionTypeEnum.Income,
        summary.income,
      ),
      availableYears,
    };
  }

  private buildSummary(transactions: Transaction[]): PeriodSummary {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (tx.type === TransactionTypeEnum.Expense) expense += amount;
      else income += amount;
    }
    const net = income - expense;
    return {
      income,
      expense,
      net,
      savingsRate: income > 0 ? (net / income) * 100 : 0,
      transactionCount: transactions.length,
    };
  }

  private buildPrevious(
    current: PeriodSummary,
    previous: PeriodSummary,
    previousTxs: Transaction[],
    year: number,
    month: number | null,
  ): PreviousPeriod | null {
    if (previousTxs.length === 0) return null;
    const label = month ? this.previousMonthLabel(year, month) : `${year - 1}`;
    return {
      label,
      income: previous.income,
      expense: previous.expense,
      net: previous.net,
      netDeltaPercent: this.deltaPercent(current.net, previous.net),
      incomeDeltaPercent: this.deltaPercent(current.income, previous.income),
      expenseDeltaPercent: this.deltaPercent(current.expense, previous.expense),
    };
  }

  private buildTrend(
    transactions: Transaction[],
    periods: string[],
  ): TrendPoint[] {
    const buckets = new Map<string, { income: number; expense: number }>();
    for (const period of periods) {
      buckets.set(period, { income: 0, expense: 0 });
    }

    for (const tx of transactions) {
      const bucket = buckets.get(this.keyOf(tx.date));
      if (!bucket) continue;
      const amount = Number(tx.amount);
      if (tx.type === TransactionTypeEnum.Expense) bucket.expense += amount;
      else bucket.income += amount;
    }

    return periods.map((period) => {
      const bucket = buckets.get(period) ?? { income: 0, expense: 0 };
      const monthIndex = Number(period.split('-')[1]) - 1;
      return {
        period,
        label: MONTH_LABELS[monthIndex],
        income: bucket.income,
        expense: bucket.expense,
      };
    });
  }

  private buildCategories(
    periodTxs: Transaction[],
    previousTxs: Transaction[],
    type: TransactionTypeEnum,
    total: number,
  ): CategoryStat[] {
    const current = this.aggregateCategories(periodTxs, type);
    const previous = this.aggregateCategories(previousTxs, type);

    return Array.from(current.values())
      .sort((a, b) => b.amount - a.amount)
      .map((cat) => {
        const prevAmount = previous.get(cat.name)?.amount ?? 0;
        return {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount: cat.amount,
          count: cat.count,
          percentage: total > 0 ? (cat.amount / total) * 100 : 0,
          deltaPercent: this.deltaPercent(cat.amount, prevAmount),
        };
      });
  }

  private aggregateCategories(
    transactions: Transaction[],
    type: TransactionTypeEnum,
  ): Map<string, CategoryAccumulator> {
    const map = new Map<string, CategoryAccumulator>();
    for (const tx of transactions) {
      if (tx.type !== type) continue;
      const name = tx.category?.name ?? 'Sin categoria';
      const existing = map.get(name);
      if (existing) {
        existing.amount += Number(tx.amount);
        existing.count += 1;
      } else {
        map.set(name, {
          name,
          color: tx.category?.color ?? '#a6a6a6',
          icon: tx.category?.icon ?? null,
          amount: Number(tx.amount),
          count: 1,
        });
      }
    }
    return map;
  }

  private buildAvailableYears(
    earliest: Transaction | null,
    selectedYear: number,
    now: Date,
  ): number[] {
    const currentYear = now.getFullYear();
    const startYear = earliest
      ? Number(this.keyOf(earliest.date).split('-')[0])
      : currentYear;
    const maxYear = Math.max(currentYear, selectedYear);
    const minYear = Math.min(startYear, selectedYear);
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) years.push(y);
    return years;
  }

  private deltaPercent(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  /** 'YYYY-MM' a partir de la columna date (string o Date), sin sesgo de zona. */
  private keyOf(raw: Date | string): string {
    const s = typeof raw === 'string' ? raw : raw.toISOString();
    return s.slice(0, 7);
  }

  private keyFor(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  private startOfKey(key: string): Date {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }

  private endOfKey(key: string): Date {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month, 0, 23, 59, 59);
  }

  /** Claves de mes que componen el periodo seleccionado. */
  private periodKeys(year: number, month: number | null): string[] {
    if (month) return [this.keyFor(year, month)];
    return this.yearMonthKeys(year);
  }

  private previousPeriodKeys(year: number, month: number | null): string[] {
    if (month) {
      const d = new Date(year, month - 2, 1);
      return [this.keyFor(d.getFullYear(), d.getMonth() + 1)];
    }
    return this.yearMonthKeys(year - 1);
  }

  private yearMonthKeys(year: number): string[] {
    const keys: string[] = [];
    for (let m = 1; m <= 12; m++) keys.push(this.keyFor(year, m));
    return keys;
  }

  private lastMonthKeys(year: number, month: number, count: number): string[] {
    const keys: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      keys.push(this.keyFor(d.getFullYear(), d.getMonth() + 1));
    }
    return keys;
  }

  private previousMonthLabel(year: number, month: number): string {
    const d = new Date(year, month - 2, 1);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }
}
