/**
 * DTO de respuesta del backend.
 * `available` puede ser false cuando aun no hay data suficiente.
 */
export interface InsightDto {
  available: boolean;
  title: string;
  description: string;
  period: string;
  generatedAt: string;
  cached: boolean;
}

export type Insight = InsightDto;

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
  count: number;
  deltaPercent: number | null;
}

export interface PeriodSummary {
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

export interface PreviousPeriod {
  label: string;
  income: number;
  expense: number;
  net: number;
  netDeltaPercent: number | null;
  incomeDeltaPercent: number | null;
  expenseDeltaPercent: number | null;
}

export interface InsightStats {
  year: number;
  month: number | null;
  granularity: "month" | "year";
  label: string;
  hasData: boolean;
  hasHistory: boolean;
  isCurrentPeriod: boolean;
  daysElapsed: number | null;
  daysInMonth: number | null;
  summary: PeriodSummary;
  previous: PreviousPeriod | null;
  projection: ProjectionStats | null;
  trend: TrendPoint[];
  expenseCategories: CategoryStat[];
  incomeCategories: CategoryStat[];
  availableYears: number[];
}
