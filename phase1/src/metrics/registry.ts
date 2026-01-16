import { Registry, Gauge, Counter, Histogram } from 'prom-client';

// Create a custom registry
const register = new Registry();

// Default labels
register.setDefaultLabels({
  app: 'onchain-risk-monitor',
  network: 'sepolia',
});

// ============== Reserve Metrics ==============

const totalLiquidity = new Gauge({
  name: 'aave_total_liquidity',
  help: 'Total liquidity in the Aave pool for an asset (in token units)',
  labelNames: ['asset'],
  registers: [register],
});

const totalDebt = new Gauge({
  name: 'aave_total_debt',
  help: 'Total debt in the Aave pool for an asset (in token units)',
  labelNames: ['asset'],
  registers: [register],
});

const utilizationRate = new Gauge({
  name: 'aave_utilization_rate',
  help: 'Utilization rate of the Aave pool for an asset (percentage)',
  labelNames: ['asset'],
  registers: [register],
});

const liquidityRate = new Gauge({
  name: 'aave_liquidity_rate',
  help: 'Current liquidity rate (APY for suppliers) for an asset (percentage)',
  labelNames: ['asset'],
  registers: [register],
});

const variableBorrowRate = new Gauge({
  name: 'aave_variable_borrow_rate',
  help: 'Current variable borrow rate for an asset (percentage)',
  labelNames: ['asset'],
  registers: [register],
});

const stableBorrowRate = new Gauge({
  name: 'aave_stable_borrow_rate',
  help: 'Current stable borrow rate for an asset (percentage)',
  labelNames: ['asset'],
  registers: [register],
});

// ============== Event Counters ==============

const flashloanCount = new Counter({
  name: 'aave_flashloan_total',
  help: 'Total number of flashloan events',
  registers: [register],
});

const flashloanVolume = new Counter({
  name: 'aave_flashloan_volume_total',
  help: 'Total volume of flashloans (in token units)',
  registers: [register],
});

const liquidationCount = new Counter({
  name: 'aave_liquidation_total',
  help: 'Total number of liquidation events',
  registers: [register],
});

const liquidationVolume = new Counter({
  name: 'aave_liquidation_volume_total',
  help: 'Total volume of liquidations (debt covered, in token units)',
  registers: [register],
});

const supplyCount = new Counter({
  name: 'aave_supply_total',
  help: 'Total number of supply events',
  registers: [register],
});

const borrowCount = new Counter({
  name: 'aave_borrow_total',
  help: 'Total number of borrow events',
  registers: [register],
});

const withdrawCount = new Counter({
  name: 'aave_withdraw_total',
  help: 'Total number of withdraw events',
  registers: [register],
});

const repayCount = new Counter({
  name: 'aave_repay_total',
  help: 'Total number of repay events',
  registers: [register],
});

// ============== Collector Health Metrics ==============

const collectorHealth = new Gauge({
  name: 'collector_health',
  help: 'Health status of the collector (1 = healthy, 0 = unhealthy)',
  labelNames: ['collector'],
  registers: [register],
});

const collectorLastBlock = new Gauge({
  name: 'collector_last_block_processed',
  help: 'Last block number processed by the collector',
  labelNames: ['collector'],
  registers: [register],
});

const collectorErrors = new Counter({
  name: 'collector_errors_total',
  help: 'Total number of errors encountered by the collector',
  labelNames: ['collector'],
  registers: [register],
});

// ============== Alert Metrics ==============

const alertsTriggered = new Counter({
  name: 'alerts_triggered_total',
  help: 'Total number of alerts triggered',
  labelNames: ['severity', 'metric'],
  registers: [register],
});

const alertsSent = new Counter({
  name: 'alerts_sent_total',
  help: 'Total number of alerts successfully sent',
  labelNames: ['channel', 'severity'],
  registers: [register],
});

const alertsFailed = new Counter({
  name: 'alerts_failed_total',
  help: 'Total number of alerts that failed to send',
  labelNames: ['channel', 'severity'],
  registers: [register],
});

// ============== Processing Metrics ==============

const eventProcessingDuration = new Histogram({
  name: 'event_processing_duration_seconds',
  help: 'Duration of event processing in seconds',
  labelNames: ['event_type'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Export registry and all metrics
export const metricsRegistry = {
  register,
  // Reserve metrics
  totalLiquidity,
  totalDebt,
  utilizationRate,
  liquidityRate,
  variableBorrowRate,
  stableBorrowRate,
  // Event counters
  flashloanCount,
  flashloanVolume,
  liquidationCount,
  liquidationVolume,
  supplyCount,
  borrowCount,
  withdrawCount,
  repayCount,
  // Collector metrics
  collectorHealth,
  collectorLastBlock,
  collectorErrors,
  // Alert metrics
  alertsTriggered,
  alertsSent,
  alertsFailed,
  // Processing metrics
  eventProcessingDuration,
};

export { register };
