import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

interface HFDataPoint {
  timestamp: number;
  healthFactor: number;
}

interface HFLineGraphProps {
  data: HFDataPoint[];
  currentHF: number;
  simulatedHF?: number;
}

export function HFLineGraph({ data, currentHF, simulatedHF }: HFLineGraphProps) {
  // Generate mock historical data if none provided
  const chartData = useMemo(() => {
    if (data.length > 0) return data;

    // Generate 24 hours of mock data
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: now - (23 - i) * hourMs,
      healthFactor: currentHF + (Math.random() - 0.5) * 0.3,
    }));
  }, [data, currentHF]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.[0]) return null;

    return (
      <div className="bg-bg-elevated border border-border-subtle rounded-lg p-3 shadow-lg">
        <p className="text-xs text-text-muted">{formatTime(label)}</p>
        <p className="text-sm font-semibold text-text-primary mt-1">
          HF: {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="hfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={['auto', 'auto']}
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Danger zone reference lines */}
          <ReferenceLine
            y={1}
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            label={{
              value: 'Liquidation',
              position: 'right',
              fill: '#ef4444',
              fontSize: 10,
            }}
          />

          <ReferenceLine
            y={1.2}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            strokeOpacity={0.3}
          />

          {/* Area under the line */}
          <Area
            type="monotone"
            dataKey="healthFactor"
            fill="url(#hfGradient)"
            stroke="none"
          />

          {/* Main line */}
          <Line
            type="monotone"
            dataKey="healthFactor"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: '#8b5cf6',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />

          {/* Simulated HF line */}
          {simulatedHF !== undefined && (
            <ReferenceLine
              y={simulatedHF}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: `Simulated: ${simulatedHF.toFixed(2)}`,
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 11,
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Mini sparkline version
interface HFSparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

export function HFSparkline({ data, width = 80, height = 24 }: HFSparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  const lastValue = data[data.length - 1] || 0;
  const color =
    lastValue >= 2 ? '#22c55e' : lastValue >= 1.2 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
