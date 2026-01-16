import { useState, useMemo } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { PositionRow } from './PositionRow';
import type { Position, RiskLevel } from '../../types';
import { getRiskLevel } from '../../utils/healthFactor';

interface PositionsTableProps {
  positions: Position[];
}

type SortField = 'healthFactor' | 'collateral' | 'debt' | 'netAPY';
type SortDirection = 'asc' | 'desc';

export function PositionsTable({ positions }: PositionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('healthFactor');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredAndSortedPositions = useMemo(() => {
    let result = [...positions];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.userAddress.toLowerCase().includes(query) ||
          p.assets.some((a) => a.symbol.toLowerCase().includes(query))
      );
    }

    // Filter by risk level
    if (riskFilter !== 'all') {
      result = result.filter((p) => getRiskLevel(p.healthFactor) === riskFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortField) {
        case 'healthFactor':
          aVal = a.healthFactor;
          bVal = b.healthFactor;
          break;
        case 'collateral':
          aVal = a.totalCollateralUSD;
          bVal = b.totalCollateralUSD;
          break;
        case 'debt':
          aVal = a.totalDebtUSD;
          bVal = b.totalDebtUSD;
          break;
        case 'netAPY':
          aVal = a.netAPY;
          bVal = b.netAPY;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [positions, searchQuery, riskFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by address or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-elevated rounded-lg border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-2">
            <FilterButton
              active={riskFilter === 'all'}
              onClick={() => setRiskFilter('all')}
            >
              All
            </FilterButton>
            <FilterButton
              active={riskFilter === 'healthy'}
              onClick={() => setRiskFilter('healthy')}
              color="healthy"
            >
              Healthy
            </FilterButton>
            <FilterButton
              active={riskFilter === 'warning'}
              onClick={() => setRiskFilter('warning')}
              color="warning"
            >
              At Risk
            </FilterButton>
            <FilterButton
              active={riskFilter === 'critical'}
              onClick={() => setRiskFilter('critical')}
              color="critical"
            >
              Critical
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Sort options */}
      <div className="px-4 py-2 border-b border-border-subtle bg-bg-secondary/30 hidden sm:flex items-center gap-4 text-xs text-text-muted">
        <span>Sort by:</span>
        <SortButton
          active={sortField === 'healthFactor'}
          direction={sortField === 'healthFactor' ? sortDirection : undefined}
          onClick={() => handleSort('healthFactor')}
        >
          Health Factor
        </SortButton>
        <SortButton
          active={sortField === 'collateral'}
          direction={sortField === 'collateral' ? sortDirection : undefined}
          onClick={() => handleSort('collateral')}
        >
          Collateral
        </SortButton>
        <SortButton
          active={sortField === 'debt'}
          direction={sortField === 'debt' ? sortDirection : undefined}
          onClick={() => handleSort('debt')}
        >
          Debt
        </SortButton>
        <SortButton
          active={sortField === 'netAPY'}
          direction={sortField === 'netAPY' ? sortDirection : undefined}
          onClick={() => handleSort('netAPY')}
        >
          Net APY
        </SortButton>
      </div>

      {/* Positions list */}
      <div className="divide-y divide-border-subtle">
        {filteredAndSortedPositions.length > 0 ? (
          filteredAndSortedPositions.map((position) => (
            <div key={position.id} className="p-2">
              <PositionRow position={position} />
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-text-muted">No positions found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle bg-bg-secondary/30">
        <p className="text-sm text-text-muted text-center">
          Showing {filteredAndSortedPositions.length} of {positions.length} positions
        </p>
      </div>
    </Card>
  );
}

// Filter button component
interface FilterButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: 'healthy' | 'warning' | 'critical';
}

function FilterButton({ children, active, onClick, color }: FilterButtonProps) {
  const colorClasses = {
    healthy: active ? 'bg-status-healthy/20 text-status-healthy border-status-healthy/30' : '',
    warning: active ? 'bg-status-warning/20 text-status-warning border-status-warning/30' : '',
    critical: active ? 'bg-status-critical/20 text-status-critical border-status-critical/30' : '',
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 text-sm rounded-lg border transition-colors
        ${active && !color ? 'bg-white/10 text-text-primary border-border-hover' : ''}
        ${color && colorClasses[color]}
        ${!active ? 'border-transparent text-text-muted hover:text-text-secondary hover:bg-white/5' : ''}
      `}
    >
      {children}
    </button>
  );
}

// Sort button component
interface SortButtonProps {
  children: React.ReactNode;
  active: boolean;
  direction?: SortDirection;
  onClick: () => void;
}

function SortButton({ children, active, direction, onClick }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 px-2 py-1 rounded transition-colors
        ${active ? 'text-text-primary' : 'hover:text-text-secondary'}
      `}
    >
      {children}
      {active && (
        <ArrowUpDown className={`w-3 h-3 ${direction === 'desc' ? 'rotate-180' : ''}`} />
      )}
    </button>
  );
}
