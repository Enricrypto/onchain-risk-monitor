import { PollingCollector } from './PollingCollector';
import { EventCollector } from './EventCollector';
import { logger, auditLogger } from '../utils/logger';
import { metricsRegistry } from '../metrics/registry';

export { PollingCollector } from './PollingCollector';
export { EventCollector } from './EventCollector';

export class CollectorManager {
  private pollingCollector: PollingCollector;
  private eventCollector: EventCollector;
  private isRunning = false;

  constructor() {
    this.pollingCollector = new PollingCollector();
    this.eventCollector = new EventCollector();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('CollectorManager is already running');
      return;
    }

    logger.info('Starting CollectorManager...');
    auditLogger.log('COLLECTOR_MANAGER_START', {});

    try {
      // Start both collectors
      await Promise.all([
        this.pollingCollector.start(),
        this.eventCollector.start(),
      ]);

      this.isRunning = true;
      logger.info('CollectorManager started successfully');
    } catch (error) {
      logger.error('Failed to start CollectorManager', { error: String(error) });
      // Stop any that started
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    logger.info('Stopping CollectorManager...');
    auditLogger.log('COLLECTOR_MANAGER_STOP', {});

    await Promise.all([
      this.pollingCollector.stop(),
      this.eventCollector.stop(),
    ]);

    this.isRunning = false;
    logger.info('CollectorManager stopped');
  }

  getStatus(): {
    isRunning: boolean;
    polling: ReturnType<PollingCollector['getMetrics']>;
    event: ReturnType<EventCollector['getMetrics']>;
  } {
    return {
      isRunning: this.isRunning,
      polling: this.pollingCollector.getMetrics(),
      event: this.eventCollector.getMetrics(),
    };
  }

  isHealthy(): boolean {
    return (
      this.isRunning &&
      this.pollingCollector.isHealthy() &&
      this.eventCollector.isHealthy()
    );
  }
}
