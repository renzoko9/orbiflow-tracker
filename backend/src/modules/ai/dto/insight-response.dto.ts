export interface MonthlyInsightResponse {
  available: boolean;
  title: string;
  description: string;
  bullets: string[];
  period: string;
  generatedAt: Date;
  cached: boolean;
}
