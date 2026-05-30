import { Injectable } from '@nestjs/common';
import { Between, IsNull } from 'typeorm';
import { Transaction } from '@Entities';
import { TransactionRepository } from '@Repositories';
import { TransactionTypeEnum } from '@Enums';
import {
  CategoryStat,
  InsightStatsResponse,
  TrendPoint,
} from '../dto/insight-stats.dto';

const TREND_MONTHS = 6;
const TOP_CATEGORIES_LIMIT = 5;
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

interface CategoryAccumulator {
  name: string;
  color: string;
  icon: string | null;
  amount: number;
}

@Injectable()
export class InsightStatsService {
  constructor(private readonly transactionRepo: TransactionRepository) {}

  async getStats(userId: number): Promise<InsightStatsResponse> {
    const now = new Date();
    const currentPeriod = this.periodKey(now);
    const { start: currentStart, end: currentEnd } =
      this.periodRange(currentPeriod);

    const daysInMonth = currentEnd.getDate();
    const daysElapsed = Math.min(now.getDate(), daysInMonth);

    // Una sola query: ventana de 6 meses hasta el fin del mes actual.
    const trendStart = new Date(
      currentStart.getFullYear(),
      currentStart.getMonth() - (TREND_MONTHS - 1),
      1,
    );

    const transactions = await this.transactionRepo.find({
      where: {
        user: { id: userId },
        date: Between(trendStart, currentEnd),
        transferGroupId: IsNull(),
      },
      relations: ['category'],
    });

    const previousPeriod = this.previousPeriodKey(currentPeriod);

    const trend = this.buildTrend(transactions, currentPeriod);
    const currentTxs = transactions.filter(
      (tx) => this.periodKey(new Date(tx.date)) === currentPeriod,
    );
    const previousTxs = transactions.filter(
      (tx) => this.periodKey(new Date(tx.date)) === previousPeriod,
    );

    const currentTotals = this.sumTotals(currentTxs);
    const previousTotals = this.sumTotals(previousTxs);

    const net = currentTotals.income - currentTotals.expense;
    const savingsRate =
      currentTotals.income > 0 ? (net / currentTotals.income) * 100 : 0;

    const projectionFactor = daysElapsed > 0 ? daysInMonth / daysElapsed : 1;
    const projectedIncome = currentTotals.income * projectionFactor;
    const projectedExpense = currentTotals.expense * projectionFactor;

    const hasPrevious = previousTxs.length > 0;
    const previousNet = previousTotals.income - previousTotals.expense;

    const topCategories = this.buildTopCategories(
      currentTxs,
      previousTxs,
      currentTotals.expense,
    );

    return {
      period: currentPeriod,
      daysElapsed,
      daysInMonth,
      hasData: currentTxs.length > 0,
      month: {
        income: currentTotals.income,
        expense: currentTotals.expense,
        net,
        savingsRate,
        transactionCount: currentTxs.length,
      },
      projection: {
        income: projectedIncome,
        expense: projectedExpense,
        net: projectedIncome - projectedExpense,
      },
      previousMonth: hasPrevious
        ? {
            income: previousTotals.income,
            expense: previousTotals.expense,
            net: previousNet,
            netDeltaPercent: this.deltaPercent(net, previousNet),
            expenseDeltaPercent: this.deltaPercent(
              currentTotals.expense,
              previousTotals.expense,
            ),
          }
        : null,
      trend,
      topCategories,
    };
  }

  private sumTotals(transactions: Transaction[]): {
    income: number;
    expense: number;
  } {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      const amount = Number(tx.amount);
      if (tx.type === TransactionTypeEnum.Expense) expense += amount;
      else income += amount;
    }
    return { income, expense };
  }

  private buildTrend(
    transactions: Transaction[],
    currentPeriod: string,
  ): TrendPoint[] {
    const buckets = new Map<string, { income: number; expense: number }>();
    const periods = this.lastPeriods(currentPeriod, TREND_MONTHS);
    for (const period of periods) {
      buckets.set(period, { income: 0, expense: 0 });
    }

    for (const tx of transactions) {
      const period = this.periodKey(new Date(tx.date));
      const bucket = buckets.get(period);
      if (!bucket) continue;
      const amount = Number(tx.amount);
      if (tx.type === TransactionTypeEnum.Expense) bucket.expense += amount;
      else bucket.income += amount;
    }

    return periods.map((period) => {
      const bucket = buckets.get(period) ?? { income: 0, expense: 0 };
      const month = Number(period.split('-')[1]) - 1;
      return {
        period,
        label: MONTH_LABELS[month],
        income: bucket.income,
        expense: bucket.expense,
      };
    });
  }

  private buildTopCategories(
    currentTxs: Transaction[],
    previousTxs: Transaction[],
    totalExpense: number,
  ): CategoryStat[] {
    const current = this.aggregateExpenseCategories(currentTxs);
    const previous = this.aggregateExpenseCategories(previousTxs);

    return Array.from(current.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, TOP_CATEGORIES_LIMIT)
      .map((cat) => {
        const prevAmount = previous.get(cat.name)?.amount ?? 0;
        return {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount: cat.amount,
          percentage: totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0,
          deltaPercent:
            prevAmount > 0
              ? ((cat.amount - prevAmount) / prevAmount) * 100
              : null,
        };
      });
  }

  private aggregateExpenseCategories(
    transactions: Transaction[],
  ): Map<string, CategoryAccumulator> {
    const map = new Map<string, CategoryAccumulator>();
    for (const tx of transactions) {
      if (tx.type !== TransactionTypeEnum.Expense) continue;
      const name = tx.category?.name ?? 'Sin categoria';
      const existing = map.get(name);
      if (existing) {
        existing.amount += Number(tx.amount);
      } else {
        map.set(name, {
          name,
          color: tx.category?.color ?? '#a6a6a6',
          icon: tx.category?.icon ?? null,
          amount: Number(tx.amount),
        });
      }
    }
    return map;
  }

  private deltaPercent(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  private periodKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private periodRange(period: string): { start: Date; end: Date } {
    const [year, month] = period.split('-').map(Number);
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month, 0, 23, 59, 59),
    };
  }

  private previousPeriodKey(period: string): string {
    const [year, month] = period.split('-').map(Number);
    return this.periodKey(new Date(year, month - 2, 1));
  }

  private lastPeriods(currentPeriod: string, count: number): string[] {
    const [year, month] = currentPeriod.split('-').map(Number);
    const periods: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
      periods.push(this.periodKey(new Date(year, month - 1 - i, 1)));
    }
    return periods;
  }
}
