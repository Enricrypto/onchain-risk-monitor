// Core types for the Onchain Risk Monitor

export interface AaveReserveData {
  asset: string;
  symbol: string;
  totalLiquidity: bigint;
  totalDebt: bigint;
  utilizationRate: number;
  liquidityRate: bigint;
  variableBorrowRate: bigint;
  stableBorrowRate: bigint;
  lastUpdateTimestamp: number;
}

export interface AaveUserData {
  userAddress: string;
  totalCollateralBase: bigint;
  totalDebtBase: bigint;
  availableBorrowsBase: bigint;
  currentLiquidationThreshold: bigint;
  ltv: bigint;
  healthFactor: bigint;
}

export interface FlashloanEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  initiator: string;
  asset: string;
  amount: bigint;
  premium: bigint;
}

export interface LiquidationEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  collateralAsset: string;
  debtAsset: string;
  user: string;
  debtToCover: bigint;
  liquidatedCollateralAmount: bigint;
  liquidator: string;
}

export interface SupplyEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  reserve: string;
  user: string;
  onBehalfOf: string;
  amount: bigint;
}

export interface BorrowEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  reserve: string;
  user: string;
  onBehalfOf: string;
  amount: bigint;
  interestRateMode: number;
  borrowRate: bigint;
}

export interface WithdrawEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  reserve: string;
  user: string;
  to: string;
  amount: bigint;
}

export interface RepayEvent {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  reserve: string;
  user: string;
  repayer: string;
  amount: bigint;
  useATokens: boolean;
}

export interface CollectorMetrics {
  lastBlockProcessed: number;
  eventsProcessed: number;
  errorsCount: number;
  lastUpdateTimestamp: number;
  isHealthy: boolean;
}

export interface AlertThreshold {
  metric: string;
  warningThreshold: number;
  criticalThreshold: number;
  enabled: boolean;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

export interface AuditLogEntry {
  timestamp: number;
  action: string;
  details: Record<string, unknown>;
  hash: string;
  previousHash: string;
}

export type EventType =
  | 'Flashloan'
  | 'LiquidationCall'
  | 'Supply'
  | 'Borrow'
  | 'Withdraw'
  | 'Repay';

export interface ProcessedEvent {
  type: EventType;
  data: FlashloanEvent | LiquidationEvent | SupplyEvent | BorrowEvent | WithdrawEvent | RepayEvent;
  processed: boolean;
  processedAt: number;
}
