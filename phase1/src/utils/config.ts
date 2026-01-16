import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // RPC Configuration
  rpcUrl: process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
  chainId: parseInt(process.env.CHAIN_ID || '11155111', 10),
  networkName: process.env.NETWORK_NAME || 'sepolia',

  // Aave V3 Sepolia Contract Addresses
  aavePoolAddress: process.env.AAVE_POOL_ADDRESS || '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
  aavePoolDataProvider: process.env.AAVE_POOL_DATA_PROVIDER || '0x3e9708d80f7B3e43118013075F7e95CE3AB31F31',

  // Prometheus/Metrics
  metricsPort: parseInt(process.env.METRICS_PORT || '9090', 10),
  metricsPath: process.env.METRICS_PATH || '/metrics',

  // Telegram Alerting
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

  // Email Alerting
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },
  alertEmailFrom: process.env.ALERT_EMAIL_FROM || '',
  alertEmailTo: process.env.ALERT_EMAIL_TO || '',

  // Collector Configuration
  pollingIntervalMs: parseInt(process.env.POLLING_INTERVAL_MS || '30000', 10),
  eventConfirmationBlocks: parseInt(process.env.EVENT_CONFIRMATION_BLOCKS || '2', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || './logs/collector.log',
} as const;

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.rpcUrl || config.rpcUrl.includes('YOUR_')) {
    errors.push('RPC_URL is not configured properly');
  }

  if (!config.aavePoolAddress) {
    errors.push('AAVE_POOL_ADDRESS is required');
  }

  // Optional: Warn about missing alerting config
  if (!config.telegramBotToken || !config.telegramChatId) {
    console.warn('Warning: Telegram alerting is not configured');
  }

  if (!config.smtp.user || !config.smtp.password) {
    console.warn('Warning: Email alerting is not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
