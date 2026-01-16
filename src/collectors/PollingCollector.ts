import { type Address } from 'viem';
import {
  getClient,
  getBlockNumber,
  getAllReservesTokens,
  getReserveData,
} from '../utils/client';
import { config } from '../utils/config';
import { logger, auditLogger } from '../utils/logger';
import { metricsRegistry } from '../metrics/registry';
import { AaveReserveData, CollectorMetrics } from '../types';

export class PollingCollector {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastBlockProcessed = 0n;
  private metrics: CollectorMetrics = {
    lastBlockProcessed: 0,
    eventsProcessed: 0,
    errorsCount: 0,
    lastUpdateTimestamp: 0,
    isHealthy: true,
  };
  private reserves: Array<{ symbol: string; tokenAddress: Address }> = [];

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('PollingCollector is already running');
      return;
    }

    logger.info('Starting PollingCollector...', {
      pollingInterval: config.pollingIntervalMs,
    });

    // Load reserves list
    await this.loadReserves();

    // Initial poll
    await this.poll();

    // Schedule regular polling
    this.intervalId = setInterval(() => {
      this.poll().catch((error) => {
        logger.error('Polling error', { error: String(error) });
        this.metrics.errorsCount++;
      });
    }, config.pollingIntervalMs);

    this.isRunning = true;
    auditLogger.log('COLLECTOR_START', { collector: 'PollingCollector' });
    logger.info('PollingCollector started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    auditLogger.log('COLLECTOR_STOP', { collector: 'PollingCollector' });
    logger.info('PollingCollector stopped');
  }

  private async loadReserves(): Promise<void> {
    try {
      this.reserves = await getAllReservesTokens();
      logger.info('Loaded reserves', {
        count: this.reserves.length,
        symbols: this.reserves.map((r) => r.symbol),
      });
    } catch (error) {
      logger.error('Failed to load reserves', { error: String(error) });
      throw error;
    }
  }

  private async poll(): Promise<void> {
    const startTime = Date.now();
    logger.debug('Starting poll cycle');

    try {
      const currentBlock = await getBlockNumber();

      // Skip if no new blocks
      if (currentBlock <= this.lastBlockProcessed) {
        logger.debug('No new blocks', { currentBlock: currentBlock.toString() });
        return;
      }

      // Collect reserve data for all assets
      const reserveDataPromises = this.reserves.map(async (reserve) => {
        try {
          const data = await getReserveData(reserve.tokenAddress);
          return this.parseReserveData(reserve, data);
        } catch (error) {
          logger.warn('Failed to fetch reserve data', {
            symbol: reserve.symbol,
            error: String(error),
          });
          return null;
        }
      });

      const reserveDataResults = await Promise.all(reserveDataPromises);
      const validReserveData = reserveDataResults.filter(
        (data): data is AaveReserveData => data !== null
      );

      // Update Prometheus metrics
      for (const data of validReserveData) {
        this.updateMetrics(data);
      }

      // Update collector state
      this.lastBlockProcessed = currentBlock;
      this.metrics.lastBlockProcessed = Number(currentBlock);
      this.metrics.lastUpdateTimestamp = Date.now();
      this.metrics.eventsProcessed += validReserveData.length;
      this.metrics.isHealthy = true;

      // Update collector health metrics
      metricsRegistry.collectorLastBlock.set(
        { collector: 'polling' },
        Number(currentBlock)
      );
      metricsRegistry.collectorHealth.set({ collector: 'polling' }, 1);

      const elapsed = Date.now() - startTime;
      logger.info('Poll cycle completed', {
        block: currentBlock.toString(),
        reservesUpdated: validReserveData.length,
        elapsedMs: elapsed,
      });
    } catch (error) {
      this.metrics.errorsCount++;
      this.metrics.isHealthy = false;
      metricsRegistry.collectorHealth.set({ collector: 'polling' }, 0);
      metricsRegistry.collectorErrors.inc({ collector: 'polling' });
      logger.error('Poll cycle failed', { error: String(error) });
      throw error;
    }
  }

  private parseReserveData(
    reserve: { symbol: string; tokenAddress: Address },
    data: readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number]
  ): AaveReserveData {
    const [
      unbacked,
      accruedToTreasuryScaled,
      totalAToken,
      totalStableDebt,
      totalVariableDebt,
      liquidityRate,
      variableBorrowRate,
      stableBorrowRate,
      averageStableBorrowRate,
      liquidityIndex,
      variableBorrowIndex,
      lastUpdateTimestamp,
    ] = data;

    const totalLiquidity = totalAToken;
    const totalDebt = totalStableDebt + totalVariableDebt;
    const utilizationRate =
      totalLiquidity > 0n
        ? Number((totalDebt * 10000n) / totalLiquidity) / 100
        : 0;

    return {
      asset: reserve.tokenAddress,
      symbol: reserve.symbol,
      totalLiquidity,
      totalDebt,
      utilizationRate,
      liquidityRate,
      variableBorrowRate,
      stableBorrowRate,
      lastUpdateTimestamp,
    };
  }

  private updateMetrics(data: AaveReserveData): void {
    const labels = { asset: data.symbol };

    // Convert from ray (27 decimals) to human-readable where applicable
    const rayDivisor = 10n ** 27n;

    metricsRegistry.totalLiquidity.set(
      labels,
      Number(data.totalLiquidity) / 1e18
    );
    metricsRegistry.totalDebt.set(labels, Number(data.totalDebt) / 1e18);
    metricsRegistry.utilizationRate.set(labels, data.utilizationRate);
    metricsRegistry.liquidityRate.set(
      labels,
      Number(data.liquidityRate * 100n / rayDivisor)
    );
    metricsRegistry.variableBorrowRate.set(
      labels,
      Number(data.variableBorrowRate * 100n / rayDivisor)
    );
    metricsRegistry.stableBorrowRate.set(
      labels,
      Number(data.stableBorrowRate * 100n / rayDivisor)
    );
  }

  getMetrics(): CollectorMetrics {
    return { ...this.metrics };
  }

  isHealthy(): boolean {
    return this.metrics.isHealthy;
  }
}
