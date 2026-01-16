import type { RiskLevel } from '../types';

// Get risk level from health factor
export function getRiskLevel(healthFactor: number): RiskLevel {
  if (healthFactor >= 2.0) return 'healthy';
  if (healthFactor >= 1.2) return 'warning';
  return 'critical';
}

// Get color class based on risk level
export function getRiskColorClass(level: RiskLevel): string {
  switch (level) {
    case 'healthy':
      return 'text-status-healthy';
    case 'warning':
      return 'text-status-warning';
    case 'critical':
      return 'text-status-critical';
  }
}

// Get background color class based on risk level
export function getRiskBgClass(level: RiskLevel): string {
  switch (level) {
    case 'healthy':
      return 'bg-status-healthy/10';
    case 'warning':
      return 'bg-status-warning/10';
    case 'critical':
      return 'bg-status-critical/10';
  }
}

// Get border color class based on risk level
export function getRiskBorderClass(level: RiskLevel): string {
  switch (level) {
    case 'healthy':
      return 'border-status-healthy/30';
    case 'warning':
      return 'border-status-warning/30';
    case 'critical':
      return 'border-status-critical/30';
  }
}

// Get glow class based on risk level
export function getRiskGlowClass(level: RiskLevel): string {
  switch (level) {
    case 'healthy':
      return 'glow-healthy';
    case 'warning':
      return 'glow-warning';
    case 'critical':
      return 'glow-critical';
  }
}

// Calculate liquidation distance percentage
export function getLiquidationDistance(healthFactor: number): number {
  // Distance from liquidation (HF = 1)
  // 100% means HF >= 2 (safe)
  // 0% means HF = 1 (liquidation)
  if (healthFactor >= 2) return 100;
  if (healthFactor <= 1) return 0;
  return ((healthFactor - 1) / 1) * 100;
}

// Get descriptive status text
export function getStatusText(healthFactor: number): string {
  if (healthFactor >= 3) return 'Very Safe';
  if (healthFactor >= 2) return 'Safe';
  if (healthFactor >= 1.5) return 'Moderate Risk';
  if (healthFactor >= 1.2) return 'At Risk';
  if (healthFactor >= 1.1) return 'High Risk';
  return 'Critical';
}

// Calculate new health factor after price change
export function calculateNewHF(
  _currentHF: number,
  collateralUSD: number,
  debtUSD: number,
  liquidationThreshold: number,
  collateralPriceChange: number // percentage change, e.g., -10 for 10% drop
): number {
  const priceMultiplier = 1 + collateralPriceChange / 100;
  const newCollateralUSD = collateralUSD * priceMultiplier;
  return (newCollateralUSD * liquidationThreshold) / debtUSD;
}

// Find price drop percentage that would cause liquidation
export function findLiquidationPrice(
  collateralUSD: number,
  debtUSD: number,
  liquidationThreshold: number
): number {
  // At liquidation: HF = 1
  // 1 = (collateral * LT) / debt
  // collateral_liq = debt / LT
  const collateralAtLiquidation = debtUSD / liquidationThreshold;
  const priceDropPercent = ((collateralUSD - collateralAtLiquidation) / collateralUSD) * 100;
  return Math.max(0, priceDropPercent);
}
