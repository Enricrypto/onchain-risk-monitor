import axios from 'axios';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { Alert } from '../types';

export class TelegramNotifier {
  private botToken: string;
  private chatId: string;
  private enabled: boolean;

  constructor() {
    this.botToken = config.telegramBotToken;
    this.chatId = config.telegramChatId;
    this.enabled = !!(this.botToken && this.chatId);

    if (!this.enabled) {
      logger.warn('Telegram notifier disabled: missing bot token or chat ID');
    }
  }

  async send(alert: Alert): Promise<boolean> {
    if (!this.enabled) {
      logger.debug('Telegram notification skipped (not configured)');
      return false;
    }

    const emoji = this.getSeverityEmoji(alert.severity);
    const message = this.formatMessage(alert, emoji);

    try {
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        },
        {
          timeout: 10000,
        }
      );

      if (response.data.ok) {
        logger.debug('Telegram notification sent', { alertId: alert.id });
        return true;
      } else {
        logger.error('Telegram API error', { response: response.data });
        return false;
      }
    } catch (error) {
      logger.error('Failed to send Telegram notification', {
        error: error instanceof Error ? error.message : String(error),
        alertId: alert.id,
      });
      return false;
    }
  }

  private getSeverityEmoji(severity: Alert['severity']): string {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return '🟢';
      default:
        return '⚪';
    }
  }

  private formatMessage(alert: Alert, emoji: string): string {
    const timestamp = new Date(alert.timestamp).toISOString();
    const severityLabel = alert.severity.toUpperCase();

    return `${emoji} <b>Onchain Risk Monitor Alert</b>

<b>Severity:</b> ${severityLabel}
<b>Metric:</b> ${alert.metric}
<b>Value:</b> ${alert.value.toFixed(4)}
<b>Threshold:</b> ${alert.threshold}
<b>Time:</b> ${timestamp}

<i>${alert.message}</i>

#aave #sepolia #${alert.severity}`;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async testConnection(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const response = await axios.get(
        `https://api.telegram.org/bot${this.botToken}/getMe`,
        { timeout: 10000 }
      );
      return response.data.ok;
    } catch (error) {
      logger.error('Telegram connection test failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
