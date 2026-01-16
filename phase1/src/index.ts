import { config, validateConfig } from './utils/config';
import { logger } from './utils/logger';
import { testConnection, getBlockNumber, getAllReservesTokens } from './utils/client';

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
    logger.warn('Could not fetch reserves (may need valid RPC)', { error });
  }

  logger.info('Initialization complete. Ready to start collectors.');
}

main().catch((error) => {
  logger.error('Fatal error', { error });
  process.exit(1);
});
