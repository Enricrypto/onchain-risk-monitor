import { useState, useCallback, useMemo } from 'react';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import type { Position } from '../../types';
import { simulatePriceDropMock } from '../../services/mockData';
import { formatUSD } from '../../utils/formatters';

interface SimulatePriceSliderProps {
  position: Position;
}

export function SimulatePriceSlider({ position }: SimulatePriceSliderProps) {
  const [priceDropPercent, setPriceDropPercent] = useState(10);
  const [selectedAsset, setSelectedAsset] = useState<string>(
    position.assets.find((a) => a.type === 'collateral')?.symbol || 'ETH'
  );

  const collateralAssets = position.assets.filter((a) => a.type === 'collateral');

  const simulation = useMemo(() => {
    return simulatePriceDropMock(position, selectedAsset, priceDropPercent);
  }, [position, selectedAsset, priceDropPercent]);

  const handleReset = useCallback(() => {
    setPriceDropPercent(10);
  }, []);

  const hfColor = simulation.simulatedHealthFactor >= 2
    ? 'text-status-healthy'
    : simulation.simulatedHealthFactor >= 1.2
    ? 'text-status-warning'
    : 'text-status-critical';

  return (
    <Card variant="elevated" padding="lg" className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-transparent pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-accent-orange/15">
            <TrendingDown className="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Price Drop Simulator
            </h3>
            <p className="text-sm text-text-muted">
              See how price changes affect your health factor
            </p>
          </div>
        </div>

        {/* Asset selector */}
        <div className="mb-6">
          <label className="text-sm text-text-muted mb-2 block">
            Select Collateral Asset
          </label>
          <div className="flex flex-wrap gap-2">
            {collateralAssets.map((asset) => (
              <button
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset.symbol)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    selectedAsset === asset.symbol
                      ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                      : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:border-border-hover'
                  }
                `}
              >
                {asset.symbol}
                <span className="ml-2 text-text-muted">
                  {formatUSD(asset.usdValue, true)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Price drop slider */}
        <div className="mb-8">
          <Slider
            label={`${selectedAsset} Price Drop`}
            value={priceDropPercent}
            min={0}
            max={50}
            step={1}
            onChange={(e) => setPriceDropPercent(Number(e.target.value))}
            formatValue={(v) => `-${v}%`}
            variant={simulation.liquidationRisk ? 'danger' : 'default'}
            markers={[0, 10, 20, 30, 40, 50]}
          />
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
            <span className="text-xs text-text-muted block mb-1">
              Current Health Factor
            </span>
            <span className="text-2xl font-bold text-text-primary tabular-nums">
              {simulation.originalHealthFactor.toFixed(2)}
            </span>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              simulation.liquidationRisk
                ? 'bg-status-critical/10 border-status-critical/30'
                : 'bg-bg-card border-border-subtle'
            }`}
          >
            <span className="text-xs text-text-muted block mb-1">
              Simulated Health Factor
            </span>
            <span className={`text-2xl font-bold tabular-nums ${hfColor}`}>
              {simulation.simulatedHealthFactor.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Liquidation warning */}
        {simulation.liquidationRisk && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-status-critical/10 border border-status-critical/30 mb-6">
            <AlertTriangle className="w-5 h-5 text-status-critical flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-status-critical">
                Liquidation Risk!
              </p>
              <p className="text-sm text-text-secondary mt-1">
                A {priceDropPercent}% price drop in {selectedAsset} would trigger liquidation.
                Your position would be liquidated when HF falls below 1.0.
              </p>
            </div>
          </div>
        )}

        {/* Additional stats */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-text-muted">Price to liquidation: </span>
            <span className="text-text-primary font-medium">
              -{simulation.priceToLiquidation.toFixed(1)}%
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}
