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
