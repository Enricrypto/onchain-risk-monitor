import nodemailer from 'nodemailer';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { Alert } from '../types';

export class EmailNotifier {
  private transporter: nodemailer.Transporter | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = !!(
      config.smtp.host &&
      config.smtp.user &&
      config.smtp.password &&
      config.alertEmailTo
    );

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.password,
        },
      });
    } else {
      logger.warn('Email notifier disabled: missing SMTP configuration');
    }
  }

  async send(alert: Alert): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.debug('Email notification skipped (not configured)');
      return false;
    }

    const subject = this.formatSubject(alert);
    const html = this.formatHtml(alert);
    const text = this.formatText(alert);

    try {
      await this.transporter.sendMail({
        from: config.alertEmailFrom || config.smtp.user,
        to: config.alertEmailTo,
        subject,
        text,
        html,
      });

      logger.debug('Email notification sent', { alertId: alert.id });
      return true;
    } catch (error) {
      logger.error('Failed to send email notification', {
        error: error instanceof Error ? error.message : String(error),
        alertId: alert.id,
      });
      return false;
    }
  }

  private formatSubject(alert: Alert): string {
    const severityPrefix = alert.severity === 'critical' ? '🔴 CRITICAL' :
                          alert.severity === 'warning' ? '🟡 WARNING' : '🟢 INFO';
    return `[Onchain Risk Monitor] ${severityPrefix}: ${alert.metric}`;
  }

  private formatHtml(alert: Alert): string {
    const timestamp = new Date(alert.timestamp).toISOString();
    const severityColor = alert.severity === 'critical' ? '#dc3545' :
                         alert.severity === 'warning' ? '#ffc107' : '#28a745';

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background-color: ${severityColor}; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .metric { font-size: 14px; color: #666; margin-bottom: 10px; }
    .value { font-size: 24px; font-weight: bold; color: #333; }
    .message { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 15px; }
    .footer { text-align: center; padding: 15px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Alert: ${alert.severity.toUpperCase()}</h1>
    </div>
    <div class="content">
      <div class="metric">Metric: <strong>${alert.metric}</strong></div>
      <div class="value">${alert.value.toFixed(4)}</div>
      <div class="metric">Threshold: ${alert.threshold}</div>
      <div class="metric">Time: ${timestamp}</div>
      <div class="message">
        ${alert.message}
      </div>
    </div>
    <div class="footer">
      Onchain Risk Monitor - Aave Sepolia Testnet<br>
      <small>This is an automated alert from the monitoring system.</small>
    </div>
  </div>
</body>
</html>`;
  }

  private formatText(alert: Alert): string {
    const timestamp = new Date(alert.timestamp).toISOString();
    return `
Onchain Risk Monitor Alert

Severity: ${alert.severity.toUpperCase()}
Metric: ${alert.metric}
Value: ${alert.value.toFixed(4)}
Threshold: ${alert.threshold}
Time: ${timestamp}

${alert.message}

---
This is an automated alert from the Onchain Risk Monitor system.
Network: Aave Sepolia Testnet
`;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async testConnection(): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email connection test failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
