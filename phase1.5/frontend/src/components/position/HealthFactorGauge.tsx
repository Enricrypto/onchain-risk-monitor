import { useMemo } from 'react';
import { getRiskLevel, getStatusText } from '../../utils/healthFactor';
import { formatHealthFactor } from '../../utils/formatters';

interface HealthFactorGaugeProps {
  healthFactor: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function HealthFactorGauge({
  healthFactor,
  size = 'md',
  showLabel = true,
}: HealthFactorGaugeProps) {
  const riskLevel = getRiskLevel(healthFactor);

  const sizeConfig = {
    sm: { width: 120, strokeWidth: 8, fontSize: 'text-xl' },
    md: { width: 180, strokeWidth: 10, fontSize: 'text-3xl' },
    lg: { width: 240, strokeWidth: 12, fontSize: 'text-4xl' },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Map health factor to percentage (0-100%)
  // HF 1.0 = 0%, HF 3.0+ = 100%
  const normalizedHF = useMemo(() => {
    if (healthFactor <= 1) return 0;
    if (healthFactor >= 3) return 100;
    return ((healthFactor - 1) / 2) * 100;
  }, [healthFactor]);

  const strokeDashoffset = circumference - (normalizedHF / 100) * circumference;

  const colors = {
    healthy: { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' },
    warning: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
    critical: { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
  };

  const color = colors[riskLevel];

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative"
        style={{ width: config.width, height: config.width }}
      >
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={config.width}
          height={config.width}
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${color.glow})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold tabular-nums ${config.fontSize}`}
            style={{ color: color.stroke }}
          >
            {formatHealthFactor(healthFactor)}
          </span>
          {showLabel && (
            <span className="text-xs text-text-muted mt-1">Health Factor</span>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="mt-4 text-center">
        <span
          className="text-sm font-medium"
          style={{ color: color.stroke }}
        >
          {getStatusText(healthFactor)}
        </span>
      </div>
    </div>
  );
}

// Linear health factor bar
interface HealthFactorBarProps {
  healthFactor: number;
  showMarkers?: boolean;
}

export function HealthFactorBar({
  healthFactor,
  showMarkers = true,
}: HealthFactorBarProps) {
  const riskLevel = getRiskLevel(healthFactor);

  // Map HF to percentage (1.0 = 0%, 3.0+ = 100%)
  const percentage = Math.min(100, Math.max(0, ((healthFactor - 1) / 2) * 100));

  const colors = {
    healthy: 'bg-status-healthy',
    warning: 'bg-status-warning',
    critical: 'bg-status-critical',
  };

  const markers = [
    { label: 'Liquidation', position: 0, hf: 1.0 },
    { label: 'Critical', position: 10, hf: 1.2 },
    { label: 'Safe', position: 50, hf: 2.0 },
    { label: 'Very Safe', position: 100, hf: 3.0 },
  ];

  return (
    <div className="w-full">
      {/* Bar */}
      <div className="relative h-3 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${colors[riskLevel]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        {/* Current position marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-bg-primary shadow-lg transition-all duration-300"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>

      {/* Markers */}
      {showMarkers && (
        <div className="relative mt-2 h-6">
          {markers.map((marker) => (
            <div
              key={marker.label}
              className="absolute flex flex-col items-center"
              style={{ left: `${marker.position}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-px h-2 bg-border-subtle" />
              <span className="text-[10px] text-text-muted whitespace-nowrap">
                {marker.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
