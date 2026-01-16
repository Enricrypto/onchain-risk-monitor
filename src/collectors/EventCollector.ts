import { type Address, type Log, parseAbiItem } from 'viem';
import { getClient, getBlockNumber, getBlock } from '../utils/client';
import { config } from '../utils/config';
import { logger, auditLogger } from '../utils/logger';
import { metricsRegistry } from '../metrics/registry';
import {
  FlashloanEvent,
  LiquidationEvent,
  SupplyEvent,
  BorrowEvent,
  WithdrawEvent,
  RepayEvent,
  CollectorMetrics,
  ProcessedEvent,
} from '../types';

// Event signatures
const FLASHLOAN_EVENT = parseAbiItem(
  'event FlashLoan(address indexed target, address initiator, address indexed asset, uint256 amount, uint8 interestRateMode, uint256 premium, uint16 indexed referralCode)'
);
const LIQUIDATION_EVENT = parseAbiItem(
  'event LiquidationCall(address indexed collateralAsset, address indexed debtAsset, address indexed user, uint256 debtToCover, uint256 liquidatedCollateralAmount, address liquidator, bool receiveAToken)'
);
const SUPPLY_EVENT = parseAbiItem(
  'event Supply(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint16 indexed referralCode)'
);
const BORROW_EVENT = parseAbiItem(
  'event Borrow(address indexed reserve, address user, address indexed onBehalfOf, uint256 amount, uint8 interestRateMode, uint256 borrowRate, uint16 indexed referralCode)'
);
const WITHDRAW_EVENT = parseAbiItem(
  'event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount)'
);
const REPAY_EVENT = parseAbiItem(
  'event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount, bool useATokens)'
);

export class EventCollector {
  private isRunning = false;
  private unwatch: (() => void) | null = null;
  private processedEvents: Map<string, ProcessedEvent> = new Map();
  private lastBlockProcessed = 0n;
  private metrics: CollectorMetrics = {
    lastBlockProcessed: 0,
    eventsProcessed: 0,
    errorsCount: 0,
    lastUpdateTimestamp: 0,
    isHealthy: true,
  };

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('EventCollector is already running');
      return;
    }

    logger.info('Starting EventCollector...');

    const client = getClient();
    const poolAddress = config.aavePoolAddress as Address;

    // Get current block for starting point
    this.lastBlockProcessed = await getBlockNumber();

    // Watch for all Aave events
    this.unwatch = client.watchContractEvent({
      address: poolAddress,
      abi: [
        FLASHLOAN_EVENT,
        LIQUIDATION_EVENT,
        SUPPLY_EVENT,
        BORROW_EVENT,
        WITHDRAW_EVENT,
        REPAY_EVENT,
      ],
      onLogs: (logs) => this.handleLogs(logs),
      onError: (error) => {
        logger.error('Event subscription error', { error: String(error) });
        this.metrics.errorsCount++;
        this.metrics.isHealthy = false;
        metricsRegistry.collectorHealth.set({ collector: 'event' }, 0);
        metricsRegistry.collectorErrors.inc({ collector: 'event' });
      },
    });

    this.isRunning = true;
    auditLogger.log('COLLECTOR_START', { collector: 'EventCollector' });
    logger.info('EventCollector started', {
      poolAddress,
      fromBlock: this.lastBlockProcessed.toString(),
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.unwatch) {
      this.unwatch();
      this.unwatch = null;
    }

    this.isRunning = false;
    auditLogger.log('COLLECTOR_STOP', { collector: 'EventCollector' });
    logger.info('EventCollector stopped');
  }

  private async handleLogs(logs: Log[]): Promise<void> {
    for (const log of logs) {
      try {
        await this.processLog(log);
      } catch (error) {
        logger.error('Error processing log', {
          txHash: log.transactionHash,
          error: String(error),
        });
        this.metrics.errorsCount++;
      }
    }
  }

  private async processLog(log: Log): Promise<void> {
    const eventKey = `${log.transactionHash}-${log.logIndex}`;

    // Deduplication check
    if (this.processedEvents.has(eventKey)) {
      logger.debug('Skipping duplicate event', { eventKey });
      return;
    }

    const client = getClient();
    const block = await getBlock(log.blockNumber!);
    const timestamp = Number(block.timestamp);

    // Determine event type and parse
    const eventName = this.getEventName(log);
    if (!eventName) {
      logger.debug('Unknown event type', { topics: log.topics });
      return;
    }

    logger.info('Processing event', {
      type: eventName,
      block: log.blockNumber?.toString(),
      txHash: log.transactionHash,
    });

    switch (eventName) {
      case 'FlashLoan':
        await this.handleFlashloan(log, timestamp);
        break;
      case 'LiquidationCall':
        await this.handleLiquidation(log, timestamp);
        break;
      case 'Supply':
        await this.handleSupply(log, timestamp);
        break;
      case 'Borrow':
        await this.handleBorrow(log, timestamp);
        break;
      case 'Withdraw':
        await this.handleWithdraw(log, timestamp);
        break;
      case 'Repay':
        await this.handleRepay(log, timestamp);
        break;
    }

    // Update metrics
    this.metrics.eventsProcessed++;
    this.metrics.lastBlockProcessed = Number(log.blockNumber);
    this.metrics.lastUpdateTimestamp = Date.now();
    this.metrics.isHealthy = true;

    metricsRegistry.collectorLastBlock.set(
      { collector: 'event' },
      Number(log.blockNumber)
    );
    metricsRegistry.collectorHealth.set({ collector: 'event' }, 1);

    // Mark as processed
    this.processedEvents.set(eventKey, {
      type: eventName as any,
      data: {} as any,
      processed: true,
      processedAt: Date.now(),
    });

    // Cleanup old processed events (keep last 10000)
    if (this.processedEvents.size > 10000) {
      const keysToDelete = Array.from(this.processedEvents.keys()).slice(
        0,
        1000
      );
      keysToDelete.forEach((k) => this.processedEvents.delete(k));
    }
  }

  private getEventName(log: Log): string | null {
    if (!log.topics || log.topics.length === 0) return null;

    const topic0 = log.topics[0];

    // Event topic signatures (keccak256 hashes)
    const signatures: Record<string, string> = {
      '0x631042c832b07452973831137f2d73e395028b44b250dedc5abb0ee766e168ac': 'FlashLoan',
      '0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286': 'LiquidationCall',
      '0x2b627736bca15cd5381dcf80b0bf11fd197d01a037c52b927a881a10fb73ba61': 'Supply',
      '0xb3d084820fb1a9decffb176436bd02558d15fac9b0ddfed8c465bc7359d7dce0': 'Borrow',
      '0x3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9f7': 'Withdraw',
      '0xa534c8dbe71f871f9f3530e97a74601fea17b426cae02e1c5aee42c96c784051': 'Repay',
    };

    return signatures[topic0 as string] || null;
  }

  private async handleFlashloan(log: Log, timestamp: number): Promise<void> {
    const event: FlashloanEvent = {
      transactionHash: log.transactionHash!,
      blockNumber: Number(log.blockNumber),
      timestamp,
      initiator: log.topics![1] as string, // Simplified - actual decoding would be more complex
      asset: log.topics![2] as string,
      amount: BigInt(log.data?.slice(0, 66) || '0'),
      premium: 0n, // Would need proper ABI decoding
    };

    metricsRegistry.flashloanCount.inc();
    metricsRegistry.flashloanVolume.inc(Number(event.amount) / 1e18);

    auditLogger.log('EVENT_FLASHLOAN', {
      txHash: event.transactionHash,
      asset: event.asset,
      amount: event.amount.toString(),
    });

    logger.info('Flashloan detected', {
      txHash: event.transactionHash,
      asset: event.asset.slice(0, 10),
      amount: (Number(event.amount) / 1e18).toFixed(4),
    });
  }

  private async handleLiquidation(log: Log, timestamp: number): Promise<void> {
    const event: LiquidationEvent = {
      transactionHash: log.transactionHash!,
      blockNumber: Number(log.blockNumber),
      timestamp,
      collateralAsset: log.topics![1] as string,
      debtAsset: log.topics![2] as string,
      user: log.topics![3] as string,
      debtToCover: BigInt(log.data?.slice(0, 66) || '0'),
      liquidatedCollateralAmount: 0n,
      liquidator: '',
    };

    metricsRegistry.liquidationCount.inc();
    metricsRegistry.liquidationVolume.inc(Number(event.debtToCover) / 1e18);

    auditLogger.log('EVENT_LIQUIDATION', {
      txHash: event.transactionHash,
      user: event.user,
      debtToCover: event.debtToCover.toString(),
    });

    logger.warn('Liquidation detected', {
      txHash: event.transactionHash,
      user: event.user.slice(0, 10),
      debtToCover: (Number(event.debtToCover) / 1e18).toFixed(4),
    });
  }

  private async handleSupply(log: Log, timestamp: number): Promise<void> {
    metricsRegistry.supplyCount.inc();
    auditLogger.log('EVENT_SUPPLY', {
      txHash: log.transactionHash,
      reserve: log.topics![1],
    });
  }

  private async handleBorrow(log: Log, timestamp: number): Promise<void> {
    metricsRegistry.borrowCount.inc();
    auditLogger.log('EVENT_BORROW', {
      txHash: log.transactionHash,
      reserve: log.topics![1],
    });
  }

  private async handleWithdraw(log: Log, timestamp: number): Promise<void> {
    metricsRegistry.withdrawCount.inc();
    auditLogger.log('EVENT_WITHDRAW', {
      txHash: log.transactionHash,
      reserve: log.topics![1],
    });
  }

  private async handleRepay(log: Log, timestamp: number): Promise<void> {
    metricsRegistry.repayCount.inc();
    auditLogger.log('EVENT_REPAY', {
      txHash: log.transactionHash,
      reserve: log.topics![1],
    });
  }

  getMetrics(): CollectorMetrics {
    return { ...this.metrics };
  }

  isHealthy(): boolean {
    return this.metrics.isHealthy;
  }
}
