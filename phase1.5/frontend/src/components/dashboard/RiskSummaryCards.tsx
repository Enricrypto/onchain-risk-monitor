import { Shield, AlertTriangle, AlertOctagon, TrendingUp, Wallet, Banknote } from 'lucide-react';
import { Card } from '../ui/Card';
import type { MetricsSummary } from '../../types';
import { formatUSD } from '../../utils/formatters';

interface RiskSummaryCardsProps {
  summary: MetricsSummary;
}

export function RiskSummaryCards({ summary }: RiskSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Healthy Positions */}
      <Card
        variant="default"
        padding="md"
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-status-healthy/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-status-healthy/15">
              <Shield className="w-4 h-4 text-status-healthy" />
            </div>
            <span className="text-sm text-text-muted uppercase tracking-wide">Healthy</span>
          </div>
          <div className="text-3xl font-bold text-text-primary tabular-nums">
            {summary.healthyCount}
          </div>
          <div className="text-sm text-text-muted mt-1">
            positions
          </div>
        </div>
      </Card>

      {/* At Risk Positions */}
      <Card
        variant="default"
        padding="md"
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-status-warning/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-status-warning/15">
              <AlertTriangle className="w-4 h-4 text-status-warning" />
            </div>
            <span className="text-sm text-text-muted uppercase tracking-wide">At Risk</span>
          </div>
          <div className="text-3xl font-bold text-text-primary tabular-nums">
            {summary.atRiskCount}
          </div>
          <div className="text-sm text-text-muted mt-1">
            positions
          </div>
        </div>
      </Card>

      {/* Critical Positions */}
      <Card
        variant="default"
        padding="md"
        className={`relative overflow-hidden ${summary.criticalCount > 0 ? 'glow-critical' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-status-critical/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-status-critical/15">
              <AlertOctagon className="w-4 h-4 text-status-critical" />
            </div>
            <span className="text-sm text-text-muted uppercase tracking-wide">Critical</span>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${summary.criticalCount > 0 ? 'text-status-critical' : 'text-text-primary'}`}>
            {summary.criticalCount}
          </div>
          <div className="text-sm text-text-muted mt-1">
            positions
          </div>
        </div>
      </Card>

      {/* Average Leverage */}
      <Card
        variant="default"
        padding="md"
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-accent-purple/15">
              <TrendingUp className="w-4 h-4 text-accent-purple" />
            </div>
            <span className="text-sm text-text-muted uppercase tracking-wide">Leverage</span>
          </div>
          <div className="text-3xl font-bold text-text-primary tabular-nums">
            {summary.averageLeverage.toFixed(1)}x
          </div>
          <div className="text-sm text-text-muted mt-1">
            avg leverage
          </div>
        </div>
      </Card>
    </div>
  );
}

// Large stats cards for total value
interface TotalValueCardsProps {
  summary: MetricsSummary;
}

export function TotalValueCards({ summary }: TotalValueCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Collateral */}
      <Card
        variant="gradient"
        padding="lg"
        pattern="grid"
        className="relative"
      >
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent-teal/20">
              <Wallet className="w-6 h-6 text-accent-teal" />
            </div>
            <div>
              <span className="text-sm text-text-muted uppercase tracking-wide">Total Collateral</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-text-primary tabular-nums">
            {formatUSD(summary.totalCollateralUSD, true)}
          </div>
          <div className="text-sm text-text-secondary mt-2">
            across {summary.totalPositions} positions
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute top-4 right-4 w-24 h-24 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent-teal"
            />
          </svg>
        </div>
      </Card>

      {/* Total Debt */}
      <Card
        variant="gradient"
        padding="lg"
        pattern="grid"
        className="relative"
      >
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-accent-orange/20">
              <Banknote className="w-6 h-6 text-accent-orange" />
            </div>
            <div>
              <span className="text-sm text-text-muted uppercase tracking-wide">Total Debt</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-text-primary tabular-nums">
            {formatUSD(summary.totalDebtUSD, true)}
          </div>
          <div className="text-sm text-text-secondary mt-2">
            avg HF: {summary.averageHealthFactor.toFixed(2)}
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute top-4 right-4 w-24 h-24 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect
              x="10"
              y="10"
              width="80"
              height="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent-orange"
              transform="rotate(15 50 50)"
            />
          </svg>
        </div>
      </Card>
    </div>
  );
}
