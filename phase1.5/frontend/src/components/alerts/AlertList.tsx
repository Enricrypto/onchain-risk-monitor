import { AlertCircle, AlertTriangle, Info, Check, Bell } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Alert, AlertSeverity } from '../../types';
import { formatRelativeTime, formatTimestamp } from '../../utils/formatters';

interface AlertListProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
}

export function AlertList({ alerts, onAcknowledge }: AlertListProps) {
  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Active Alerts
          {activeAlerts.length > 0 && (
            <Badge variant="danger" size="sm">
              {activeAlerts.length}
            </Badge>
          )}
        </h3>

        {activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
              />
            ))}
          </div>
        ) : (
          <Card variant="outlined" padding="md">
            <div className="text-center py-4">
              <Check className="w-8 h-8 text-status-healthy mx-auto mb-2" />
              <p className="text-sm text-text-muted">No active alerts</p>
            </div>
          </Card>
        )}
      </div>

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">
            Recent History
          </h3>
          <div className="space-y-2">
            {acknowledgedAlerts.slice(0, 5).map((alert) => (
              <AlertCardCompact key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Full alert card
interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
}

function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const severityConfig = getSeverityConfig(alert.severity);

  return (
    <Card
      variant="default"
      padding="md"
      className={`border-l-4 ${severityConfig.borderColor}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${severityConfig.bgColor}`}>
          {severityConfig.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={severityConfig.badgeVariant} size="sm">
              {alert.severity.toUpperCase()}
            </Badge>
            <span className="text-xs text-text-muted">
              {formatRelativeTime(alert.timestamp)}
            </span>
          </div>

          <p className="text-sm text-text-primary font-medium mb-2">
            {alert.message}
          </p>

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>
              Metric: <span className="text-text-secondary">{alert.metric}</span>
            </span>
            <span>
              Value: <span className="text-text-secondary">{alert.value.toFixed(2)}</span>
            </span>
            <span>
              Threshold: <span className="text-text-secondary">{alert.threshold}</span>
            </span>
          </div>
        </div>

        {onAcknowledge && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAcknowledge(alert.id)}
          >
            Acknowledge
          </Button>
        )}
      </div>
    </Card>
  );
}

// Compact alert card for history
function AlertCardCompact({ alert }: { alert: Alert }) {
  const severityConfig = getSeverityConfig(alert.severity);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-card/50">
      <div className={`w-2 h-2 rounded-full ${severityConfig.dotColor}`} />
      <span className="text-sm text-text-secondary flex-1 truncate">
        {alert.message}
      </span>
      <span className="text-xs text-text-muted">
        {formatTimestamp(alert.timestamp)}
      </span>
    </div>
  );
}

// Helper function for severity configuration
function getSeverityConfig(severity: AlertSeverity) {
  const configs = {
    critical: {
      icon: <AlertCircle className="w-5 h-5 text-status-critical" />,
      bgColor: 'bg-status-critical/15',
      borderColor: 'border-status-critical',
      dotColor: 'bg-status-critical',
      badgeVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-status-warning" />,
      bgColor: 'bg-status-warning/15',
      borderColor: 'border-status-warning',
      dotColor: 'bg-status-warning',
      badgeVariant: 'warning' as const,
    },
    info: {
      icon: <Info className="w-5 h-5 text-accent-cyan" />,
      bgColor: 'bg-accent-cyan/15',
      borderColor: 'border-accent-cyan',
      dotColor: 'bg-accent-cyan',
      badgeVariant: 'info' as const,
    },
  };

  return configs[severity];
}

// Alert summary component
interface AlertSummaryProps {
  alerts: Alert[];
}

export function AlertSummary({ alerts }: AlertSummaryProps) {
  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical' && !a.acknowledged
  ).length;
  const warningCount = alerts.filter(
    (a) => a.severity === 'warning' && !a.acknowledged
  ).length;
  const infoCount = alerts.filter(
    (a) => a.severity === 'info' && !a.acknowledged
  ).length;

  return (
    <div className="flex items-center gap-4">
      {criticalCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-critical animate-pulse" />
          <span className="text-sm text-status-critical font-medium">
            {criticalCount} Critical
          </span>
        </div>
      )}
      {warningCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-warning" />
          <span className="text-sm text-status-warning font-medium">
            {warningCount} Warning
          </span>
        </div>
      )}
      {infoCount > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent-cyan" />
          <span className="text-sm text-accent-cyan font-medium">
            {infoCount} Info
          </span>
        </div>
      )}
      {criticalCount === 0 && warningCount === 0 && infoCount === 0 && (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-status-healthy" />
          <span className="text-sm text-status-healthy font-medium">
            All Clear
          </span>
        </div>
      )}
    </div>
  );
}
