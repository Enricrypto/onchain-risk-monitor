import { Send, ExternalLink } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Alert } from '../../types';
import { formatTimestamp } from '../../utils/formatters';

interface TelegramPreviewProps {
  alert: Alert;
}

export function TelegramPreview({ alert }: TelegramPreviewProps) {
  const severityEmoji = {
    critical: '\u{1F534}', // Red circle
    warning: '\u{1F7E0}', // Orange circle
    info: '\u{1F535}', // Blue circle
  };

  const formatTelegramMessage = (alert: Alert) => {
    return `${severityEmoji[alert.severity]} <b>Onchain Risk Monitor Alert</b>

<b>Severity:</b> ${alert.severity.toUpperCase()}
<b>Metric:</b> ${alert.metric}
<b>Value:</b> ${alert.value.toFixed(4)}
<b>Threshold:</b> ${alert.threshold}
<b>Time:</b> ${new Date(alert.timestamp).toISOString()}

${alert.message}

#aave #sepolia #${alert.severity}`;
  };

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      {/* Telegram header */}
      <div className="bg-[#2AABEE] px-4 py-3 flex items-center gap-3">
        <Send className="w-5 h-5 text-white" />
        <span className="font-medium text-white">Telegram Preview</span>
      </div>

      {/* Message preview */}
      <div className="p-4 bg-[#0E1621]">
        <div className="bg-[#182533] rounded-lg p-4 max-w-sm">
          {/* Bot avatar and name */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-orange flex items-center justify-center">
              <span className="text-xs text-white font-bold">RM</span>
            </div>
            <div>
              <span className="text-sm font-medium text-[#71B0DE]">
                Risk Monitor Bot
              </span>
              <span className="text-xs text-[#6C7883] ml-2">bot</span>
            </div>
          </div>

          {/* Message content */}
          <div className="text-sm text-[#F5F5F5] whitespace-pre-line">
            <TelegramFormattedMessage message={formatTelegramMessage(alert)} />
          </div>

          {/* Timestamp */}
          <div className="text-right mt-2">
            <span className="text-xs text-[#6C7883]">
              {new Date(alert.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-bg-secondary border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs text-text-muted">
          This is how alerts appear in Telegram
        </span>
        <a
          href="https://t.me/botfather"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-accent-cyan hover:underline"
        >
          Configure Bot
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}

// Parse and render Telegram HTML formatting
function TelegramFormattedMessage({ message }: { message: string }) {
  // Simple HTML-like tag parser for Telegram format
  const parts = message.split(/(<b>|<\/b>|<i>|<\/i>|<code>|<\/code>)/);

  let isBold = false;
  let isItalic = false;
  let isCode = false;

  return (
    <>
      {parts.map((part, index) => {
        if (part === '<b>') {
          isBold = true;
          return null;
        }
        if (part === '</b>') {
          isBold = false;
          return null;
        }
        if (part === '<i>') {
          isItalic = true;
          return null;
        }
        if (part === '</i>') {
          isItalic = false;
          return null;
        }
        if (part === '<code>') {
          isCode = true;
          return null;
        }
        if (part === '</code>') {
          isCode = false;
          return null;
        }

        let className = '';
        if (isBold) className += ' font-bold';
        if (isItalic) className += ' italic';
        if (isCode) className += ' font-mono bg-black/30 px-1 rounded';

        // Handle hashtags
        const formattedPart = part.split(/(#\w+)/).map((segment, i) => {
          if (segment.startsWith('#')) {
            return (
              <span key={i} className="text-[#71B0DE]">
                {segment}
              </span>
            );
          }
          return segment;
        });

        return (
          <span key={index} className={className}>
            {formattedPart}
          </span>
        );
      })}
    </>
  );
}

// Email preview component
interface EmailPreviewProps {
  alert: Alert;
}

export function EmailPreview({ alert }: EmailPreviewProps) {
  const severityColor = {
    critical: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
  };

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      {/* Email header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Email Preview</span>
          <span className="text-xs text-gray-500">noreply@risk-monitor.io</span>
        </div>
      </div>

      {/* Email subject */}
      <div className="bg-gray-50 px-4 py-2 border-b">
        <span className="text-sm text-gray-700">
          Subject: [Onchain Risk Monitor] {severityEmoji(alert.severity)} {alert.severity.toUpperCase()}: {alert.metric}
        </span>
      </div>

      {/* Email body */}
      <div className="p-6 bg-white">
        <div
          className="w-full max-w-md mx-auto p-4 rounded-lg"
          style={{ backgroundColor: `${severityColor[alert.severity]}15` }}
        >
          <div
            className="text-lg font-bold mb-2"
            style={{ color: severityColor[alert.severity] }}
          >
            {alert.severity.toUpperCase()} Alert
          </div>
          <p className="text-gray-700 text-sm mb-4">{alert.message}</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Metric: {alert.metric}</p>
            <p>Value: {alert.value.toFixed(4)}</p>
            <p>Threshold: {alert.threshold}</p>
            <p>Time: {formatTimestamp(alert.timestamp)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function severityEmoji(severity: string): string {
  const emojis: Record<string, string> = {
    critical: '\u{1F534}',
    warning: '\u{1F7E0}',
    info: '\u{1F535}',
  };
  return emojis[severity] || '';
}
