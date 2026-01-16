import { config } from '../utils/config';
import { logger, auditLogger } from '../utils/logger';
import { metricsRegistry } from '../metrics/registry';
import { Alert, AlertThreshold } from '../types';
import { TelegramNotifier } from './TelegramNotifier';
import { EmailNotifier } from './EmailNotifier';

export class AlertManager {
  private thresholds: Map<string, AlertThreshold> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private circuitBreakerOpen = false;
  private alertCount = 0;
  private lastAlertTime = 0;
  private telegramNotifier: TelegramNotifier;
  private emailNotifier: EmailNotifier;

  // Circuit breaker settings
  private readonly maxAlertsPerMinute = 10;
  private readonly circuitBreakerCooldownMs = 60000; // 1 minute

  constructor() {
    this.telegramNotifier = new TelegramNotifier();
    this.emailNotifier = new EmailNotifier();
    this.initializeDefaultThresholds();
  }

  private initializeDefaultThresholds(): void {
    // Utilization rate thresholds
    this.setThreshold({
      metric: 'utilization_rate',
      warningThreshold: 80,
      criticalThreshold: 95,
      enabled: true,
    });

    // Flashloan volume threshold (in tokens per hour)
    this.setThreshold({
      metric: 'flashloan_volume_hourly',
      warningThreshold: 1000000,
      criticalThreshold: 10000000,
      enabled: true,
    });

    // Liquidation count threshold (per hour)
    this.setThreshold({
      metric: 'liquidation_count_hourly',
      warningThreshold: 10,
      criticalThreshold: 50,
      enabled: true,
    });

    // Collector health threshold
    this.setThreshold({
      metric: 'collector_health',
      warningThreshold: 0, // Any unhealthy state triggers warning
      criticalThreshold: 0,
      enabled: true,
    });

    logger.info('Default alert thresholds initialized', {
      count: this.thresholds.size,
    });
  }

  setThreshold(threshold: AlertThreshold): void {
    this.thresholds.set(threshold.metric, threshold);
    auditLogger.log('THRESHOLD_SET', {
      metric: threshold.metric,
      warning: threshold.warningThreshold,
      critical: threshold.criticalThreshold,
    });
  }

  getThreshold(metric: string): AlertThreshold | undefined {
    return this.thresholds.get(metric);
  }

  async checkAndAlert(metric: string, value: number, labels?: Record<string, string>): Promise<void> {
    const threshold = this.thresholds.get(metric);
    if (!threshold || !threshold.enabled) {
      return;
    }

    const alertKey = labels ? `${metric}:${JSON.stringify(labels)}` : metric;

    // Determine severity
    let severity: 'info' | 'warning' | 'critical' | null = null;
    if (value >= threshold.criticalThreshold) {
      severity = 'critical';
    } else if (value >= threshold.warningThreshold) {
      severity = 'warning';
    }

    // Check if this is a new alert or an update
    const existingAlert = this.activeAlerts.get(alertKey);

    if (severity === null) {
      // Value is below thresholds - resolve any existing alert
      if (existingAlert) {
        await this.resolveAlert(alertKey, existingAlert, value);
      }
      return;
    }

    // Create or update alert
    if (!existingAlert || existingAlert.severity !== severity) {
      const alert: Alert = {
        id: `${alertKey}-${Date.now()}`,
        severity,
        metric,
        message: this.formatAlertMessage(metric, value, threshold, severity, labels),
        value,
        threshold: severity === 'critical' ? threshold.criticalThreshold : threshold.warningThreshold,
        timestamp: Date.now(),
        acknowledged: false,
      };

      this.activeAlerts.set(alertKey, alert);
      await this.sendAlert(alert);
    }
  }

  private formatAlertMessage(
    metric: string,
    value: number,
    threshold: AlertThreshold,
    severity: 'warning' | 'critical',
    labels?: Record<string, string>
  ): string {
    const labelStr = labels ? ` [${Object.entries(labels).map(([k, v]) => `${k}=${v}`).join(', ')}]` : '';
    const thresholdValue = severity === 'critical' ? threshold.criticalThreshold : threshold.warningThreshold;

    return `${severity.toUpperCase()}: ${metric}${labelStr} is ${value.toFixed(2)} (threshold: ${thresholdValue})`;
  }

  private async resolveAlert(alertKey: string, alert: Alert, currentValue: number): Promise<void> {
    this.activeAlerts.delete(alertKey);

    const resolution = {
      severity: 'info' as const,
      metric: alert.metric,
      message: `RESOLVED: ${alert.metric} is now ${currentValue.toFixed(2)} (was ${alert.value.toFixed(2)})`,
      value: currentValue,
      threshold: alert.threshold,
      timestamp: Date.now(),
      acknowledged: false,
      id: `${alertKey}-resolved-${Date.now()}`,
    };

    await this.sendAlert(resolution);

    auditLogger.log('ALERT_RESOLVED', {
      alertKey,
      previousValue: alert.value,
      currentValue,
    });

    logger.info('Alert resolved', {
      metric: alert.metric,
      previousValue: alert.value,
      currentValue,
    });
  }

  private async sendAlert(alert: Alert): Promise<void> {
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      const elapsed = Date.now() - this.lastAlertTime;
      if (elapsed < this.circuitBreakerCooldownMs) {
        logger.warn('Circuit breaker open, dropping alert', {
          alertId: alert.id,
          cooldownRemaining: this.circuitBreakerCooldownMs - elapsed,
        });
        return;
      }
      // Reset circuit breaker
      this.circuitBreakerOpen = false;
      this.alertCount = 0;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastAlertTime > 60000) {
      this.alertCount = 0;
    }

    if (this.alertCount >= this.maxAlertsPerMinute) {
      this.circuitBreakerOpen = true;
      logger.warn('Too many alerts, circuit breaker activated', {
        alertCount: this.alertCount,
      });

      // Send a single summary alert about the circuit breaker
      await this.sendToChannels({
        ...alert,
        message: `CIRCUIT BREAKER: Too many alerts (${this.alertCount}+). Pausing alerts for ${this.circuitBreakerCooldownMs / 1000}s`,
        severity: 'critical',
      });
      return;
    }

    this.alertCount++;
    this.lastAlertTime = now;

    // Send to all configured channels
    await this.sendToChannels(alert);

    // Update metrics
    metricsRegistry.alertsTriggered.inc({
      severity: alert.severity,
      metric: alert.metric,
    });

    auditLogger.log('ALERT_SENT', {
      alertId: alert.id,
      severity: alert.severity,
      metric: alert.metric,
      value: alert.value,
    });

    logger.info('Alert sent', {
      alertId: alert.id,
      severity: alert.severity,
      metric: alert.metric,
    });
  }

  private async sendToChannels(alert: Alert): Promise<void> {
    const results = await Promise.allSettled([
      this.telegramNotifier.send(alert),
      this.emailNotifier.send(alert),
    ]);

    results.forEach((result, index) => {
      const channel = index === 0 ? 'telegram' : 'email';
      if (result.status === 'fulfilled' && result.value) {
        metricsRegistry.alertsSent.inc({ channel, severity: alert.severity });
      } else if (result.status === 'rejected') {
        metricsRegistry.alertsFailed.inc({ channel, severity: alert.severity });
        logger.error(`Failed to send ${channel} alert`, {
          error: result.reason,
          alertId: alert.id,
        });
      }
    });
  }

  acknowledgeAlert(alertKey: string): boolean {
    const alert = this.activeAlerts.get(alertKey);
    if (alert) {
      alert.acknowledged = true;
      auditLogger.log('ALERT_ACKNOWLEDGED', { alertKey });
      return true;
    }
    return false;
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  getStatus(): {
    activeAlerts: number;
    circuitBreakerOpen: boolean;
    alertsLastMinute: number;
  } {
    return {
      activeAlerts: this.activeAlerts.size,
      circuitBreakerOpen: this.circuitBreakerOpen,
      alertsLastMinute: this.alertCount,
    };
  }
}
