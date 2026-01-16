import { Card } from '../ui/Card';
import type { OraclePrices } from '../../types';
import { formatUSD } from '../../utils/formatters';

interface BentoGridProps {
  oraclePrices: OraclePrices;
}

export function BentoGrid({ oraclePrices }: BentoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Oracle Prices Bento - Full width on mobile, spans 2 cols on sm+ */}
      <Card
        variant="elevated"
        padding="lg"
        pattern="dots"
        className="sm:col-span-2 relative overflow-hidden min-h-[200px]"
      >
        <div className="relative z-10">
          <h3 className="text-sm text-text-muted uppercase tracking-wide mb-4">
            Oracle Prices
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            {Object.entries(oraclePrices).slice(0, 6).map(([symbol, price]) => (
              <div key={symbol} className="flex items-center justify-between gap-2">
                <span className="text-text-secondary font-medium text-sm">{symbol}</span>
                <span className="text-text-primary tabular-nums font-mono text-sm">
                  {formatUSD(price)}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative pyramid */}
        <div className="absolute -right-4 -bottom-4 sm:-right-8 sm:-bottom-8 w-28 h-28 sm:w-40 sm:h-40 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="pyramidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <polygon
              points="50,10 90,90 10,90"
              fill="none"
              stroke="url(#pyramidGradient)"
              strokeWidth="2"
            />
            <polygon
              points="50,10 50,70 90,90"
              fill="url(#pyramidGradient)"
              fillOpacity="0.2"
            />
          </svg>
        </div>
      </Card>

      {/* Network Status - Full width on mobile */}
      <Card
        variant="default"
        padding="lg"
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-radial-glow" />
        <div className="relative">
          <span className="text-xs text-text-muted uppercase tracking-wide">Network</span>
          <div className="text-2xl sm:text-xl font-bold text-text-primary mt-2">Sepolia</div>
          <div className="text-sm text-text-muted mt-1">Ethereum Testnet</div>
          <div className="flex items-center gap-2 mt-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-healthy opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-status-healthy" />
            </span>
            <span className="text-xs text-status-healthy font-medium">Live</span>
          </div>
        </div>
      </Card>

      {/* Protocol - Full width on mobile */}
      <Card
        variant="default"
        padding="lg"
        className="relative overflow-hidden"
      >
        <div className="relative">
          <span className="text-xs text-text-muted uppercase tracking-wide">Protocol</span>
          <div className="text-2xl sm:text-xl font-bold gradient-text mt-2">Aave V3</div>
          <div className="text-sm text-text-muted mt-1">Lending Pool</div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-accent-purple font-medium">Monitored</span>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="2" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="#f59e0b" strokeWidth="2" />
          </svg>
        </div>
      </Card>

      {/* Composability - Full width */}
      <Card
        variant="outlined"
        padding="lg"
        pattern="grid"
        className="sm:col-span-2 relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-xs text-text-muted uppercase tracking-wide">Composability</span>
            <div className="text-xl sm:text-lg font-semibold text-text-primary mt-1">
              Onchain Monitoring
            </div>
            <div className="text-sm text-text-secondary mt-1">
              Real-time risk assessment
            </div>
          </div>
          {/* Geometric decoration */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 opacity-50 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="#8b5cf6" strokeWidth="0.5" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="#8b5cf6" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Price ticker component
interface PriceTickerProps {
  prices: OraclePrices;
}

export function PriceTicker({ prices }: PriceTickerProps) {
  const priceList = Object.entries(prices);

  return (
    <div className="overflow-hidden bg-bg-secondary/50 border-y border-border-subtle py-2">
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
        {[...priceList, ...priceList].map(([symbol, price], i) => (
          <div key={`${symbol}-${i}`} className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">{symbol}</span>
            <span className="text-sm tabular-nums text-text-primary">
              {formatUSD(price)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
