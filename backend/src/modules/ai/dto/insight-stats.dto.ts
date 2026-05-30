export interface TrendPoint {
  period: string;
  label: string;
  income: number;
  expense: number;
}

export interface CategoryStat {
  name: string;
  color: string;
  icon: string | null;
  amount: number;
  percentage: number;
  deltaPercent: number | null;
}

export interface MonthStats {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  transactionCount: number;
}

export interface ProjectionStats {
  income: number;
  expense: number;
  net: number;
}

export interface PreviousMonthStats {
  income: number;
  expense: number;
  net: number;
  netDeltaPercent: number | null;
  expenseDeltaPercent: number | null;
}

export interface InsightStatsResponse {
  period: string;
  daysElapsed: number;
  daysInMonth: number;
  hasData: boolean;
  month: MonthStats;
  projection: ProjectionStats;
  previousMonth: PreviousMonthStats | null;
  trend: TrendPoint[];
  topCategories: CategoryStat[];
}
