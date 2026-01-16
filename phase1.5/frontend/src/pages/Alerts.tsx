import { useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { useAlerts, useAcknowledgeAlert } from '../hooks';
import { AlertList, TelegramPreview } from '../components/alerts';
import { Card } from '../components/ui/Card';
import type { Alert, AlertSeverity } from '../types';

export function Alerts() {
  const { data, isLoading } = useAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const [selectedAlert] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');

  const alerts = data?.alerts || [];

  const filteredAlerts =
    filterSeverity === 'all'
      ? alerts
      : alerts.filter((a) => a.severity === filterSeverity);

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert.mutate(id);
  };

  // Select first unacknowledged alert for preview
  const previewAlert =
    selectedAlert || filteredAlerts.find((a) => !a.acknowledged) || filteredAlerts[0];

  if (isLoading) {
    return <AlertsSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <Bell className="w-6 h-6" />
            Alerts
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Monitor and manage system alerts and notifications
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
            className="bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-purple"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Alerts"
          value={alerts.length}
          color="default"
        />
        <StatCard
          label="Active"
          value={alerts.filter((a) => !a.acknowledged).length}
          color="warning"
        />
        <StatCard
          label="Critical"
          value={alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length}
          color="critical"
        />
        <StatCard
          label="Acknowledged"
          value={alerts.filter((a) => a.acknowledged).length}
          color="success"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert list */}
        <div className="lg:col-span-2">
          <AlertList
            alerts={filteredAlerts}
            onAcknowledge={handleAcknowledge}
          />
        </div>

        {/* Preview panel */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">
              Notification Preview
            </h3>
            {previewAlert ? (
              <TelegramPreview alert={previewAlert} />
            ) : (
              <Card variant="outlined" padding="md">
                <p className="text-sm text-text-muted text-center py-8">
                  No alerts to preview
                </p>
              </Card>
            )}
          </div>

          {/* Alert configuration info */}
          <Card variant="default" padding="md">
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Alert Configuration
            </h4>
            <div className="space-y-3 text-sm">
              <ConfigItem
                label="Health Factor Warning"
                value="< 2.0"
              />
              <ConfigItem
                label="Health Factor Critical"
                value="< 1.2"
              />
              <ConfigItem
                label="Utilization Rate Warning"
                value="> 80%"
              />
              <ConfigItem
                label="Utilization Rate Critical"
                value="> 95%"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-muted">
                Alert thresholds can be configured in the alertmanager settings.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  label: string;
  value: number;
  color: 'default' | 'success' | 'warning' | 'critical';
}

function StatCard({ label, value, color }: StatCardProps) {
  const colorClasses = {
    default: 'text-text-primary',
    success: 'text-status-healthy',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
  };

  return (
    <Card variant="default" padding="md">
      <span className="text-xs text-text-muted block mb-1">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${colorClasses[color]}`}>
        {value}
      </span>
    </Card>
  );
}

// Config item component
interface ConfigItemProps {
  label: string;
  value: string;
}

function ConfigItem({ label, value }: ConfigItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-mono text-xs bg-bg-elevated px-2 py-1 rounded">
        {value}
      </span>
    </div>
  );
}

// Loading skeleton
function AlertsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-bg-elevated rounded" />
          <div className="h-4 w-48 bg-bg-elevated rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-bg-elevated rounded" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} variant="default" padding="md">
            <div className="h-4 w-16 bg-bg-elevated rounded mb-2" />
            <div className="h-8 w-12 bg-bg-elevated rounded" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="default" padding="md">
              <div className="h-20 bg-bg-elevated rounded" />
            </Card>
          ))}
        </div>
        <Card variant="elevated" padding="none">
          <div className="h-64 bg-bg-elevated rounded" />
        </Card>
      </div>
    </div>
  );
}
