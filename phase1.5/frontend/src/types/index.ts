// Position types
export interface PositionAsset {
  symbol: string;
  amount: number;
  usdValue: number;
  type: 'collateral' | 'debt';
}

export interface Position {
  id: string;
  userAddress: string;
  healthFactor: number;
  totalCollateralUSD: number;
  totalDebtUSD: number;
  liquidationThreshold: number;
  ltv: number;
  netAPY: number;
  assets: PositionAsset[];
  lastUpdated: number;
}

export type RiskLevel = 'healthy' | 'warning' | 'critical';

export function getRiskLevel(healthFactor: number): RiskLevel {
  if (healthFactor >= 2.0) return 'healthy';
  if (healthFactor >= 1.2) return 'warning';
  return 'critical';
}

// Alert types
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

// Metrics summary types
export interface MetricsSummary {
  totalPositions: number;
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  totalCollateralUSD: number;
  totalDebtUSD: number;
  averageHealthFactor: number;
  averageLeverage: number;
}

// Oracle prices
export interface OraclePrices {
  [symbol: string]: number;
}

// API Response types
export interface PositionsResponse {
  positions: Position[];
  lastUpdated: number;
}

export interface AlertsResponse {
  alerts: Alert[];
  total: number;
}

export interface SummaryResponse {
  summary: MetricsSummary;
  oraclePrices: OraclePrices;
  lastUpdated: number;
}

// Simulation types
export interface PriceSimulation {
  asset: string;
  priceDropPercent: number;
}

export interface SimulationResult {
  originalHealthFactor: number;
  simulatedHealthFactor: number;
  liquidationRisk: boolean;
  priceToLiquidation: number;
}

// Reserve data
export interface ReserveData {
  asset: string;
  symbol: string;
  totalLiquidity: number;
  totalDebt: number;
  utilizationRate: number;
  liquidityRate: number;
  variableBorrowRate: number;
  stableBorrowRate: number;
}

// Collector health
export interface CollectorHealth {
  polling: boolean;
  events: boolean;
  lastBlock: number;
  errorsCount: number;
}
