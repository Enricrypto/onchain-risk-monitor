import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { StatusBadge } from '../ui/Badge';
import type { Position } from '../../types';
import { getRiskLevel } from '../../utils/healthFactor';
import { formatUSD, formatHealthFactor, truncateAddress, formatPercent } from '../../utils/formatters';

interface PositionRowProps {
  position: Position;
}

export function PositionRow({ position }: PositionRowProps) {
  const riskLevel = getRiskLevel(position.healthFactor);

  const healthFactorColor = {
    healthy: 'text-status-healthy',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
  }[riskLevel];

  return (
    <Link
      to={`/position/${position.id}`}
      className="group block"
    >
      <div className={`
        flex items-center gap-4 p-4 rounded-xl border border-border-subtle
        bg-bg-card hover:bg-bg-elevated hover:border-border-hover
        transition-all duration-200 cursor-pointer
        ${riskLevel === 'critical' ? 'border-status-critical/30' : ''}
      `}>
        {/* Address & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-text-primary">
              {truncateAddress(position.userAddress, 6)}
            </span>
            <StatusBadge status={riskLevel} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-muted">
              {position.assets.filter(a => a.type === 'collateral').map(a => a.symbol).join(', ')}
            </span>
          </div>
        </div>

        {/* Health Factor */}
        <div className="text-right w-24">
          <div className={`text-lg font-bold tabular-nums ${healthFactorColor}`}>
            {formatHealthFactor(position.healthFactor)}
          </div>
          <div className="text-xs text-text-muted">Health Factor</div>
        </div>

        {/* Collateral */}
        <div className="text-right w-28 hidden sm:block">
          <div className="text-sm font-medium text-text-primary tabular-nums">
            {formatUSD(position.totalCollateralUSD, true)}
          </div>
          <div className="text-xs text-text-muted">Collateral</div>
        </div>

        {/* Debt */}
        <div className="text-right w-28 hidden sm:block">
          <div className="text-sm font-medium text-text-primary tabular-nums">
            {formatUSD(position.totalDebtUSD, true)}
          </div>
          <div className="text-xs text-text-muted">Debt</div>
        </div>

        {/* Net APY */}
        <div className="text-right w-20 hidden md:block">
          <div className={`text-sm font-medium tabular-nums ${position.netAPY >= 0 ? 'text-status-healthy' : 'text-status-critical'}`}>
            {formatPercent(position.netAPY)}
          </div>
          <div className="text-xs text-text-muted">Net APY</div>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-secondary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}

// Compact version for mobile/summary
export function PositionRowCompact({ position }: PositionRowProps) {
  const riskLevel = getRiskLevel(position.healthFactor);

  const healthFactorColor = {
    healthy: 'text-status-healthy',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
  }[riskLevel];

  return (
    <Link
      to={`/position/${position.id}`}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          riskLevel === 'healthy' ? 'bg-status-healthy' :
          riskLevel === 'warning' ? 'bg-status-warning' : 'bg-status-critical'
        }`} />
        <span className="font-mono text-sm text-text-secondary">
          {truncateAddress(position.userAddress, 4)}
        </span>
      </div>
      <span className={`text-sm font-bold tabular-nums ${healthFactorColor}`}>
        {formatHealthFactor(position.healthFactor)}
      </span>
    </Link>
  );
}
