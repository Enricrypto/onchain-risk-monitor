import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { usePosition } from '../hooks';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import {
  HealthFactorGauge,
  HFLineGraph,
  SimulatePriceSlider,
  PositionStats,
} from '../components/position';
import { getRiskLevel } from '../utils/healthFactor';
import { truncateAddress } from '../utils/formatters';

export function PositionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: position, isLoading, error } = usePosition(id);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (position) {
      await navigator.clipboard.writeText(position.userAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <PositionDetailSkeleton />;
  }

  if (error || !position) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Position Not Found
        </h2>
        <p className="text-text-muted mb-6">
          The position you're looking for doesn't exist or has been closed.
        </p>
        <Link to="/">
          <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const riskLevel = getRiskLevel(position.healthFactor);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-text-primary font-mono">
                {truncateAddress(position.userAddress, 8)}
              </h1>
              <StatusBadge status={riskLevel} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-status-healthy" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy address
                  </>
                )}
              </button>
              <a
                href={`https://sepolia.etherscan.io/address/${position.userAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View on Etherscan
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Health Factor */}
        <div className="lg:col-span-1 space-y-6">
          <Card variant="elevated" padding="lg" className="text-center">
            <h3 className="text-sm text-text-muted mb-6">Health Factor</h3>
            <HealthFactorGauge healthFactor={position.healthFactor} size="lg" />
          </Card>

          {/* Price Simulator */}
          <SimulatePriceSlider position={position} />
        </div>

        {/* Right column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Historical HF Graph */}
          <Card variant="elevated" padding="md">
            <h3 className="text-sm font-medium text-text-secondary mb-4">
              Health Factor History (24h)
            </h3>
            <HFLineGraph
              data={[]}
              currentHF={position.healthFactor}
            />
          </Card>

          {/* Position Stats */}
          <PositionStats position={position} />
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function PositionDetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-20 bg-bg-elevated rounded" />
        <div>
          <div className="h-6 w-48 bg-bg-elevated rounded" />
          <div className="h-4 w-32 bg-bg-elevated rounded mt-2" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card variant="elevated" padding="lg">
            <div className="h-64 bg-bg-elevated rounded" />
          </Card>
          <Card variant="elevated" padding="lg">
            <div className="h-48 bg-bg-elevated rounded" />
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" padding="md">
            <div className="h-64 bg-bg-elevated rounded" />
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card variant="default" padding="md">
              <div className="h-32 bg-bg-elevated rounded" />
            </Card>
            <Card variant="default" padding="md">
              <div className="h-32 bg-bg-elevated rounded" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
