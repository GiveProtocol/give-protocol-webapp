export interface FundImpactMetric {
  id: string;
  fundId: string;
  unitName: string;
  unitCostUsd: number;
  unitIcon: string;
  descriptionTemplate: string;
  sortOrder: number;
  updatedAt: string;
}

export interface ImpactResult {
  metricId: string;
  unitName: string;
  unitIcon: string;
  value: number;
  formattedValue: string;
  description: string;
}
