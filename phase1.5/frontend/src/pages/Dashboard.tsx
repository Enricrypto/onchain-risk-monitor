import { RefreshCw } from 'lucide-react';
import { usePositions, useMetricsSummary } from '../hooks';
import { RiskSummaryCards, TotalValueCards, PositionsTable, BentoGrid } from '../components/dashboard';
import { AlertSummary } from '../components/alerts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAlerts } from '../hooks/useAlerts';

export function Dashboard() {
  const {
    data: positionsData,
    isLoading: positionsLoading,
    refetch: refetchPositions,
  } = usePositions();
  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useMetricsSummary();
  const { data: alertsData } = useAlerts();

  const isLoading = positionsLoading || summaryLoading;

  const handleRefresh = () => {
    refetchPositions();
    refetchSummary();
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const positions = positionsData?.positions || [];
  const summary = summaryData?.summary;
  const oraclePrices = summaryData?.oraclePrices || {};
  const alerts = alertsData?.alerts || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            Monitor your DeFi positions and risk exposure
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <AlertSummary alerts={alerts} />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Risk summary cards */}
      {summary && <RiskSummaryCards summary={summary} />}

      {/* Main content grid - Stack on mobile, side by side on lg */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Total value cards - Full width on mobile, 3 cols on xl */}
        <div className="xl:col-span-3">
          {summary && <TotalValueCards summary={summary} />}
        </div>

        {/* Bento grid with oracle prices - Full width on mobile, 2 cols on xl */}
        <div className="xl:col-span-2">
          <BentoGrid oraclePrices={oraclePrices} />
        </div>
      </div>

      {/* Positions table */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Monitored Positions
        </h2>
        <PositionsTable positions={positions} />
      </div>
    </div>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-7 sm:h-8 w-36 sm:w-48 bg-bg-elevated rounded" />
          <div className="h-4 w-56 sm:w-64 bg-bg-elevated rounded mt-2" />
        </div>
        <div className="h-9 sm:h-10 w-20 sm:w-24 bg-bg-elevated rounded" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="default" padding="md">
            <div className="h-4 w-16 bg-bg-elevated rounded mb-3" />
            <div className="h-8 w-12 bg-bg-elevated rounded" />
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card variant="default" padding="lg">
            <div className="h-28 sm:h-32 bg-bg-elevated rounded" />
          </Card>
          <Card variant="default" padding="lg">
            <div className="h-28 sm:h-32 bg-bg-elevated rounded" />
          </Card>
        </div>
        <div className="xl:col-span-2">
          <Card variant="default" padding="md">
            <div className="h-56 sm:h-64 bg-bg-elevated rounded" />
          </Card>
        </div>
      </div>

      {/* Table skeleton */}
      <Card variant="default" padding="none">
        <div className="p-4 border-b border-border-subtle">
          <div className="h-10 w-full bg-bg-elevated rounded" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 sm:p-4 border-b border-border-subtle">
            <div className="h-14 sm:h-16 bg-bg-elevated rounded" />
          </div>
        ))}
      </Card>
    </div>
  );
}
