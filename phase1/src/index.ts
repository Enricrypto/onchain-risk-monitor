import { config, validateConfig } from './utils/config';
import { logger, auditLogger } from './utils/logger';
import { testConnection, getBlockNumber, getAllReservesTokens } from './utils/client';
import { CollectorManager } from './collectors';
import { startMetricsServer, stopMetricsServer } from './metrics';

let collectorManager: CollectorManager | null = null;

async function main() {
  logger.info('=== Onchain Risk Monitor - Phase 1 ===');
  logger.info('Starting initialization...');

  // Validate configuration
  const { valid, errors } = validateConfig();
  if (!valid) {
    logger.error('Configuration validation failed', { errors });
    process.exit(1);
  }

  logger.info('Configuration validated', {
    network: config.networkName,
    chainId: config.chainId,
    metricsPort: config.metricsPort,
  });

  // Test RPC connection
  logger.info('Testing RPC connection...');
  const connected = await testConnection();
  if (!connected) {
    logger.error('Failed to connect to RPC endpoint');
    process.exit(1);
  }

  // Get current block number
  const blockNumber = await getBlockNumber();
  logger.info('Current block number', { blockNumber: blockNumber.toString() });

  // Get list of reserves
  logger.info('Fetching Aave reserves...');
  try {
    const reserves = await getAllReservesTokens();
    logger.info('Aave reserves fetched', {
      count: reserves.length,
      reserves: reserves.map((r) => r.symbol),
    });
  } catch (error) {
    logger.warn('Could not fetch reserves', { error: String(error) });
  }

  // Start metrics server
  await startMetricsServer();
  logger.info('Metrics server started', {
    url: `http://localhost:${config.metricsPort}${config.metricsPath}`,
  });

  // Start collectors
  collectorManager = new CollectorManager();
  await collectorManager.start();

  // Log initial audit entry
  auditLogger.log('SYSTEM_START', {
    version: '1.0.0',
    network: config.networkName,
    chainId: config.chainId,
  });

  logger.info('=== System fully initialized ===');
  logger.info('Metrics available at:', {
    metrics: `http://localhost:${config.metricsPort}${config.metricsPath}`,
    health: `http://localhost:${config.metricsPort}/health`,
    status: `http://localhost:${config.metricsPort}/status`,
  });

  // Keep the process running
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

async function shutdown() {
  logger.info('Shutdown signal received...');

  auditLogger.log('SYSTEM_SHUTDOWN', { reason: 'signal' });

  if (collectorManager) {
    await collectorManager.stop();
  }

  await stopMetricsServer();

  // Verify audit log integrity
  const verification = auditLogger.verify();
  if (!verification.valid) {
    logger.error('Audit log verification failed', { errors: verification.errors });
  } else {
    logger.info('Audit log verified successfully');
  }

  logger.info('Shutdown complete');
  process.exit(0);
}

main().catch((error) => {
  logger.error('Fatal error', { error: String(error) });
  process.exit(1);
});
