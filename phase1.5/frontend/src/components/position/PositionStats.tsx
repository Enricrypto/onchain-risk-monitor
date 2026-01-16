import { Wallet, Banknote, Percent, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Position } from '../../types';
import { formatUSD, formatCryptoAmount, formatRelativeTime, formatPercent } from '../../utils/formatters';

interface PositionStatsProps {
  position: Position;
}

export function PositionStats({ position }: PositionStatsProps) {
  const collateralAssets = position.assets.filter((a) => a.type === 'collateral');
  const debtAssets = position.assets.filter((a) => a.type === 'debt');

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Wallet className="w-4 h-4" />}
          label="Total Collateral"
          value={formatUSD(position.totalCollateralUSD, true)}
          color="teal"
        />
        <StatCard
          icon={<Banknote className="w-4 h-4" />}
          label="Total Debt"
          value={formatUSD(position.totalDebtUSD, true)}
          color="orange"
        />
        <StatCard
          icon={<Percent className="w-4 h-4" />}
          label="LTV"
          value={`${(position.ltv * 100).toFixed(0)}%`}
          color="purple"
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Last Updated"
          value={formatRelativeTime(position.lastUpdated)}
          color="default"
        />
      </div>

      {/* Asset breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collateral Assets */}
        <Card variant="default" padding="md">
          <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-teal" />
            Collateral Assets
          </h4>
          <div className="space-y-3">
            {collateralAssets.map((asset) => (
              <AssetRow
                key={asset.symbol}
                symbol={asset.symbol}
                amount={asset.amount}
                usdValue={asset.usdValue}
                percentage={(asset.usdValue / position.totalCollateralUSD) * 100}
                color="teal"
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total</span>
              <span className="font-semibold text-text-primary">
                {formatUSD(position.totalCollateralUSD)}
              </span>
            </div>
          </div>
        </Card>

        {/* Debt Assets */}
        <Card variant="default" padding="md">
          <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-orange" />
            Borrowed Assets
          </h4>
          <div className="space-y-3">
            {debtAssets.map((asset) => (
              <AssetRow
                key={asset.symbol}
                symbol={asset.symbol}
                amount={asset.amount}
                usdValue={asset.usdValue}
                percentage={(asset.usdValue / position.totalDebtUSD) * 100}
                color="orange"
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total</span>
              <span className="font-semibold text-text-primary">
                {formatUSD(position.totalDebtUSD)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional details */}
      <Card variant="outlined" padding="md">
        <h4 className="text-sm font-medium text-text-secondary mb-4">
          Position Details
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem
            label="Liquidation Threshold"
            value={`${(position.liquidationThreshold * 100).toFixed(0)}%`}
          />
          <DetailItem
            label="Max LTV"
            value={`${(position.ltv * 100).toFixed(0)}%`}
          />
          <DetailItem
            label="Net APY"
            value={formatPercent(position.netAPY)}
            valueColor={position.netAPY >= 0 ? 'text-status-healthy' : 'text-status-critical'}
          />
          <DetailItem
            label="Net Worth"
            value={formatUSD(position.totalCollateralUSD - position.totalDebtUSD, true)}
          />
        </div>
      </Card>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'teal' | 'orange' | 'purple' | 'default';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    teal: 'bg-accent-teal/15 text-accent-teal',
    orange: 'bg-accent-orange/15 text-accent-orange',
    purple: 'bg-accent-purple/15 text-accent-purple',
    default: 'bg-white/10 text-text-secondary',
  };

  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className="text-xs text-text-muted">{label}</span>
      </div>
      <div className="text-xl font-bold text-text-primary tabular-nums">
        {value}
      </div>
    </Card>
  );
}

// Asset row component
interface AssetRowProps {
  symbol: string;
  amount: number;
  usdValue: number;
  percentage: number;
  color: 'teal' | 'orange';
}

function AssetRow({ symbol, amount, usdValue, percentage, color }: AssetRowProps) {
  const barColor = color === 'teal' ? 'bg-accent-teal' : 'bg-accent-orange';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{symbol}</span>
          <span className="text-xs text-text-muted">
            {formatCryptoAmount(amount, '')}
          </span>
        </div>
        <span className="text-sm text-text-primary tabular-nums">
          {formatUSD(usdValue)}
        </span>
      </div>
      <div className="relative h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${barColor} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Detail item component
interface DetailItemProps {
  label: string;
  value: string;
  valueColor?: string;
}

function DetailItem({ label, value, valueColor = 'text-text-primary' }: DetailItemProps) {
  return (
    <div>
      <span className="text-xs text-text-muted block mb-1">{label}</span>
      <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
    </div>
  );
}
