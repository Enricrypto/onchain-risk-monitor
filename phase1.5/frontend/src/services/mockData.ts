import type {
  Position,
  Alert,
  MetricsSummary,
  OraclePrices,
  PositionsResponse,
  AlertsResponse,
  SummaryResponse,
} from '../types';

// Mock oracle prices
export const mockOraclePrices: OraclePrices = {
  ETH: 2245.67,
  WBTC: 43567.89,
  USDC: 1.0,
  USDT: 1.0,
  DAI: 0.9998,
  LINK: 14.23,
  AAVE: 98.45,
  UNI: 6.78,
};

// Mock positions
export const mockPositions: Position[] = [
  {
    id: '1',
    userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f5BEa3',
    healthFactor: 2.45,
    totalCollateralUSD: 125000,
    totalDebtUSD: 45000,
    liquidationThreshold: 0.825,
    ltv: 0.75,
    netAPY: 2.34,
    assets: [
      { symbol: 'ETH', amount: 45.5, usdValue: 102178.98, type: 'collateral' },
      { symbol: 'LINK', amount: 1600, usdValue: 22768, type: 'collateral' },
      { symbol: 'USDC', amount: 45000, usdValue: 45000, type: 'debt' },
    ],
    lastUpdated: Date.now(),
  },
  {
    id: '2',
    userAddress: '0x8B3765eDA5207fB21690874B722ae276B96f5dF6',
    healthFactor: 1.52,
    totalCollateralUSD: 78500,
    totalDebtUSD: 48000,
    liquidationThreshold: 0.80,
    ltv: 0.72,
    netAPY: -1.23,
    assets: [
      { symbol: 'WBTC', amount: 1.2, usdValue: 52281.47, type: 'collateral' },
      { symbol: 'ETH', amount: 11.67, usdValue: 26209.07, type: 'collateral' },
      { symbol: 'DAI', amount: 48000, usdValue: 47990.4, type: 'debt' },
    ],
    lastUpdated: Date.now(),
  },
  {
    id: '3',
    userAddress: '0xA1B2c3D4e5F6789012345678901234567890AbCd',
    healthFactor: 1.15,
    totalCollateralUSD: 34200,
    totalDebtUSD: 28500,
    liquidationThreshold: 0.82,
    ltv: 0.75,
    netAPY: -3.45,
    assets: [
      { symbol: 'ETH', amount: 15.23, usdValue: 34203.5, type: 'collateral' },
      { symbol: 'USDT', amount: 28500, usdValue: 28500, type: 'debt' },
    ],
    lastUpdated: Date.now(),
  },
  {
    id: '4',
    userAddress: '0xDEADBEEF12345678901234567890123456789012',
    healthFactor: 3.21,
    totalCollateralUSD: 256000,
    totalDebtUSD: 72000,
    liquidationThreshold: 0.85,
    ltv: 0.78,
    netAPY: 4.56,
    assets: [
      { symbol: 'WBTC', amount: 3.5, usdValue: 152487.62, type: 'collateral' },
      { symbol: 'ETH', amount: 46.1, usdValue: 103527.39, type: 'collateral' },
      { symbol: 'USDC', amount: 72000, usdValue: 72000, type: 'debt' },
    ],
    lastUpdated: Date.now(),
  },
  {
    id: '5',
    userAddress: '0x123456789ABCDEF0123456789ABCDEF012345678',
    healthFactor: 1.08,
    totalCollateralUSD: 15600,
    totalDebtUSD: 14000,
    liquidationThreshold: 0.80,
    ltv: 0.72,
    netAPY: -5.67,
    assets: [
      { symbol: 'ETH', amount: 6.95, usdValue: 15607.4, type: 'collateral' },
      { symbol: 'DAI', amount: 14000, usdValue: 13997.2, type: 'debt' },
    ],
    lastUpdated: Date.now(),
  },
  {
    id: '6',
    userAddress: '0xCAFEBABE12345678901234567890123456789012',
    healthFactor: 4.87,
    totalCollateralUSD: 890000,
    totalDebtUSD: 165000,
    liquidationThreshold: 0.85,
    ltv: 0.80,
    netAPY: 6.78,
    assets: [
      { symbol: 'WBTC', amount: 12.5, usdValue: 544598.63, type: 'collateral' },
      { symbol: 'ETH', amount: 154, usdValue: 345833.18, type: 'collateral' },
      { symbol: 'USDC', amount: 165000, usdValue: 165000, type: 'debt' },
    ],
    lastUpdated: Date.now(),
  },
  {
    id: '7',
    userAddress: '0x9876543210FEDCBA9876543210FEDCBA98765432',
    healthFactor: 1.89,
    totalCollateralUSD: 42500,
    totalDebtUSD: 21000,
    liquidationThreshold: 0.82,
    ltv: 0.75,
    netAPY: 1.23,
    assets: [
      { symbol: 'AAVE', amount: 320, usdValue: 31504, type: 'collateral' },
      { symbol: 'UNI', amount: 1620, usdValue: 10983.6, type: 'collateral' },
      { symbol: 'USDT', amount: 21000, usdValue: 21000, type: 'debt' },
    ],
    lastUpdated: Date.now(),
  },
];

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    severity: 'critical',
    metric: 'health_factor',
    message: 'Position 0x1234...5678 health factor dropped below 1.1',
    value: 1.08,
    threshold: 1.1,
    timestamp: Date.now() - 300000,
    acknowledged: false,
  },
  {
    id: 'alert-2',
    severity: 'warning',
    metric: 'health_factor',
    message: 'Position 0xA1B2...AbCd approaching liquidation threshold',
    value: 1.15,
    threshold: 1.2,
    timestamp: Date.now() - 600000,
    acknowledged: false,
  },
  {
    id: 'alert-3',
    severity: 'warning',
    metric: 'utilization_rate',
    message: 'USDC utilization rate exceeds 85%',
    value: 87.5,
    threshold: 85,
    timestamp: Date.now() - 1800000,
    acknowledged: true,
  },
  {
    id: 'alert-4',
    severity: 'info',
    metric: 'flashloan_volume',
    message: 'Large flashloan detected: 500,000 DAI',
    value: 500000,
    threshold: 100000,
    timestamp: Date.now() - 3600000,
    acknowledged: true,
  },
  {
    id: 'alert-5',
    severity: 'critical',
    metric: 'liquidation',
    message: 'Liquidation event: Position 0xDEAD...BEEF liquidated',
    value: 25000,
    threshold: 0,
    timestamp: Date.now() - 7200000,
    acknowledged: true,
  },
];

// Calculate summary from positions
function calculateSummary(positions: Position[]): MetricsSummary {
  const healthyCount = positions.filter(p => p.healthFactor >= 2.0).length;
  const atRiskCount = positions.filter(p => p.healthFactor >= 1.2 && p.healthFactor < 2.0).length;
  const criticalCount = positions.filter(p => p.healthFactor < 1.2).length;

  const totalCollateralUSD = positions.reduce((sum, p) => sum + p.totalCollateralUSD, 0);
  const totalDebtUSD = positions.reduce((sum, p) => sum + p.totalDebtUSD, 0);
  const averageHealthFactor = positions.reduce((sum, p) => sum + p.healthFactor, 0) / positions.length;
  const averageLeverage = totalCollateralUSD / (totalCollateralUSD - totalDebtUSD);

  return {
    totalPositions: positions.length,
    healthyCount,
    atRiskCount,
    criticalCount,
    totalCollateralUSD,
    totalDebtUSD,
    averageHealthFactor,
    averageLeverage,
  };
}

// Mock API responses
export function getMockPositions(): PositionsResponse {
  return {
    positions: mockPositions,
    lastUpdated: Date.now(),
  };
}

export function getMockPosition(address: string): Position | undefined {
  return mockPositions.find(
    p => p.userAddress.toLowerCase() === address.toLowerCase() || p.id === address
  );
}

export function getMockAlerts(limit?: number): AlertsResponse {
  const alerts = limit ? mockAlerts.slice(0, limit) : mockAlerts;
  return {
    alerts,
    total: mockAlerts.length,
  };
}

export function getMockSummary(): SummaryResponse {
  return {
    summary: calculateSummary(mockPositions),
    oraclePrices: mockOraclePrices,
    lastUpdated: Date.now(),
  };
}

// Simulate price drop calculation
export function simulatePriceDropMock(
  position: Position,
  asset: string,
  priceDropPercent: number
): {
  originalHealthFactor: number;
  simulatedHealthFactor: number;
  liquidationRisk: boolean;
  priceToLiquidation: number;
} {
  // Simplified HF calculation
  // HF = (Collateral * LiqThreshold) / Debt
  // When price drops, collateral value drops proportionally

  const collateralAsset = position.assets.find(
    a => a.symbol === asset && a.type === 'collateral'
  );

  if (!collateralAsset) {
    return {
      originalHealthFactor: position.healthFactor,
      simulatedHealthFactor: position.healthFactor,
      liquidationRisk: false,
      priceToLiquidation: 100,
    };
  }

  const dropMultiplier = 1 - priceDropPercent / 100;
  const newCollateralValue =
    position.totalCollateralUSD -
    collateralAsset.usdValue * (1 - dropMultiplier);

  const simulatedHealthFactor =
    (newCollateralValue * position.liquidationThreshold) / position.totalDebtUSD;

  // Calculate price drop needed for liquidation (HF = 1)
  // 1 = (Collateral * LT) / Debt
  // Collateral_liq = Debt / LT
  const collateralAtLiquidation = position.totalDebtUSD / position.liquidationThreshold;
  const collateralDropNeeded = position.totalCollateralUSD - collateralAtLiquidation;
  const priceToLiquidation =
    (collateralDropNeeded / collateralAsset.usdValue) * 100;

  return {
    originalHealthFactor: position.healthFactor,
    simulatedHealthFactor: Math.max(0, simulatedHealthFactor),
    liquidationRisk: simulatedHealthFactor < 1,
    priceToLiquidation: Math.max(0, Math.min(100, priceToLiquidation)),
  };
}
