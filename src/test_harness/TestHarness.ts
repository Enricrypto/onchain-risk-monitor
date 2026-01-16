import { logger, auditLogger } from '../utils/logger';
import { metricsRegistry } from '../metrics/registry';
import { AlertManager } from '../alerts/AlertManager';
import { config } from '../utils/config';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details?: string;
}

export class TestHarness {
  private alertManager: AlertManager;
  private results: TestResult[] = [];

  constructor() {
    this.alertManager = new AlertManager();
  }

  async runAllTests(): Promise<void> {
    logger.info('Running all test scenarios...');
    auditLogger.log('TEST_HARNESS_START', { scenario: 'all' });

    await this.runMetricsSimulation();
    await this.runAlertSimulation();
    await this.runStressTest();
    await this.runChaosSimulation();

    this.printSummary();
    auditLogger.log('TEST_HARNESS_END', {
      totalTests: this.results.length,
      passed: this.results.filter((r) => r.passed).length,
      failed: this.results.filter((r) => !r.passed).length,
    });
  }

  async runMetricsSimulation(): Promise<void> {
    logger.info('=== Running Metrics Simulation ===');
    auditLogger.log('TEST_SCENARIO_START', { scenario: 'metrics' });

    // Test 1: Simulate reserve data updates
    await this.runTest('Simulate Reserve Updates', async () => {
      const assets = ['DAI', 'USDC', 'WETH', 'WBTC'];

      for (const asset of assets) {
        // Simulate varying liquidity
        const liquidity = Math.random() * 10000000;
        const debt = liquidity * (0.3 + Math.random() * 0.6); // 30-90% utilization
        const utilizationRate = (debt / liquidity) * 100;

        metricsRegistry.totalLiquidity.set({ asset }, liquidity);
        metricsRegistry.totalDebt.set({ asset }, debt);
        metricsRegistry.utilizationRate.set({ asset }, utilizationRate);
        metricsRegistry.liquidityRate.set({ asset }, Math.random() * 10);
        metricsRegistry.variableBorrowRate.set({ asset }, Math.random() * 15);

        logger.debug('Simulated reserve data', {
          asset,
          liquidity: liquidity.toFixed(2),
          debt: debt.toFixed(2),
          utilization: utilizationRate.toFixed(2),
        });
      }

      // Wait a bit for metrics to settle
      await this.sleep(1000);
      return true;
    });

    // Test 2: Simulate event counters
    await this.runTest('Simulate Event Counters', async () => {
      // Simulate various events
      for (let i = 0; i < 10; i++) {
        metricsRegistry.supplyCount.inc();
        metricsRegistry.borrowCount.inc();
        await this.sleep(100);
      }

      for (let i = 0; i < 5; i++) {
        metricsRegistry.withdrawCount.inc();
        metricsRegistry.repayCount.inc();
        await this.sleep(100);
      }

      // Simulate some flashloans
      for (let i = 0; i < 3; i++) {
        metricsRegistry.flashloanCount.inc();
        metricsRegistry.flashloanVolume.inc(Math.random() * 100000);
        await this.sleep(200);
      }

      return true;
    });

    // Test 3: Verify metrics endpoint
    await this.runTest('Verify Metrics Output', async () => {
      const metrics = await metricsRegistry.register.metrics();
      const hasLiquidity = metrics.includes('aave_total_liquidity');
      const hasDebt = metrics.includes('aave_total_debt');
      const hasEvents = metrics.includes('aave_flashloan_total');

      if (!hasLiquidity || !hasDebt || !hasEvents) {
        throw new Error('Missing expected metrics in output');
      }

      logger.info('Metrics output verified', {
        length: metrics.length,
        hasLiquidity,
        hasDebt,
        hasEvents,
      });

      return true;
    });

    auditLogger.log('TEST_SCENARIO_END', { scenario: 'metrics' });
  }

  async runAlertSimulation(): Promise<void> {
    logger.info('=== Running Alert Simulation ===');
    auditLogger.log('TEST_SCENARIO_START', { scenario: 'alerts' });

    // Test 1: Warning threshold
    await this.runTest('Trigger Warning Alert', async () => {
      await this.alertManager.checkAndAlert('utilization_rate', 85, { asset: 'TEST' });
      const alerts = this.alertManager.getActiveAlerts();
      const hasWarning = alerts.some(
        (a) => a.severity === 'warning' && a.metric === 'utilization_rate'
      );
      return hasWarning;
    });

    // Test 2: Critical threshold
    await this.runTest('Trigger Critical Alert', async () => {
      await this.alertManager.checkAndAlert('utilization_rate', 98, { asset: 'TEST' });
      const alerts = this.alertManager.getActiveAlerts();
      const hasCritical = alerts.some(
        (a) => a.severity === 'critical' && a.metric === 'utilization_rate'
      );
      return hasCritical;
    });

    // Test 3: Alert resolution
    await this.runTest('Alert Resolution', async () => {
      // First trigger an alert
      await this.alertManager.checkAndAlert('utilization_rate', 98, { asset: 'RESOLVE_TEST' });

      // Then resolve it by going below threshold
      await this.alertManager.checkAndAlert('utilization_rate', 50, { asset: 'RESOLVE_TEST' });

      // Check it was resolved
      const alerts = this.alertManager.getActiveAlerts();
      const stillActive = alerts.some(
        (a) => a.metric === 'utilization_rate' &&
        a.message.includes('RESOLVE_TEST')
      );
      return !stillActive;
    });

    // Test 4: Circuit breaker
    await this.runTest('Circuit Breaker Activation', async () => {
      // Trigger many alerts rapidly
      for (let i = 0; i < 15; i++) {
        await this.alertManager.checkAndAlert(
          'flashloan_volume_hourly',
          20000000,
          { instance: `test-${i}` }
        );
      }

      const status = this.alertManager.getStatus();
      logger.info('Circuit breaker status', status);

      // Circuit breaker should be active after many alerts
      return status.circuitBreakerOpen || status.alertsLastMinute >= 10;
    });

    auditLogger.log('TEST_SCENARIO_END', { scenario: 'alerts' });
  }

  async runStressTest(): Promise<void> {
    logger.info('=== Running Stress Test ===');
    auditLogger.log('TEST_SCENARIO_START', { scenario: 'stress' });

    // Test 1: High-frequency metric updates
    await this.runTest('High-Frequency Metrics', async () => {
      const startTime = Date.now();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        metricsRegistry.totalLiquidity.set({ asset: 'STRESS' }, Math.random() * 1000000);
        metricsRegistry.totalDebt.set({ asset: 'STRESS' }, Math.random() * 500000);
        metricsRegistry.utilizationRate.set({ asset: 'STRESS' }, Math.random() * 100);
      }

      const elapsed = Date.now() - startTime;
      const opsPerSecond = (iterations / elapsed) * 1000;

      logger.info('Stress test metrics', {
        iterations,
        elapsedMs: elapsed,
        opsPerSecond: opsPerSecond.toFixed(2),
      });

      // Should be able to handle at least 1000 ops/sec
      return opsPerSecond > 1000;
    });

    // Test 2: Concurrent operations
    await this.runTest('Concurrent Operations', async () => {
      const startTime = Date.now();
      const concurrency = 100;

      const operations = Array(concurrency)
        .fill(null)
        .map(async (_, i) => {
          metricsRegistry.supplyCount.inc();
          metricsRegistry.borrowCount.inc();
          await this.alertManager.checkAndAlert(
            'utilization_rate',
            Math.random() * 100,
            { instance: `concurrent-${i}` }
          );
        });

      await Promise.all(operations);

      const elapsed = Date.now() - startTime;
      logger.info('Concurrent operations completed', {
        operations: concurrency,
        elapsedMs: elapsed,
      });

      return elapsed < 5000; // Should complete within 5 seconds
    });

    // Test 3: Memory stability
    await this.runTest('Memory Stability', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Generate lots of data
      for (let i = 0; i < 10000; i++) {
        metricsRegistry.flashloanCount.inc();
        metricsRegistry.flashloanVolume.inc(Math.random() * 1000);
      }

      // Force GC if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / 1024 / 1024; // MB

      logger.info('Memory usage', {
        initialMB: (initialMemory / 1024 / 1024).toFixed(2),
        finalMB: (finalMemory / 1024 / 1024).toFixed(2),
        growthMB: memoryGrowth.toFixed(2),
      });

      // Memory growth should be reasonable (< 50MB)
      return memoryGrowth < 50;
    });

    auditLogger.log('TEST_SCENARIO_END', { scenario: 'stress' });
  }

  async runChaosSimulation(): Promise<void> {
    logger.info('=== Running Chaos Simulation ===');
    auditLogger.log('TEST_SCENARIO_START', { scenario: 'chaos' });

    // Test 1: Simulate extreme values
    await this.runTest('Extreme Values', async () => {
      // Very high values
      metricsRegistry.totalLiquidity.set({ asset: 'EXTREME' }, Number.MAX_SAFE_INTEGER);
      metricsRegistry.totalDebt.set({ asset: 'EXTREME' }, Number.MAX_SAFE_INTEGER);

      // Zero values
      metricsRegistry.totalLiquidity.set({ asset: 'ZERO' }, 0);
      metricsRegistry.totalDebt.set({ asset: 'ZERO' }, 0);

      // Negative values (should be handled)
      metricsRegistry.utilizationRate.set({ asset: 'NEGATIVE' }, -100);

      await this.sleep(500);
      return true;
    });

    // Test 2: Simulate rapid state changes
    await this.runTest('Rapid State Changes', async () => {
      for (let i = 0; i < 50; i++) {
        // Alternate between normal and extreme states
        const isExtreme = i % 2 === 0;
        const utilization = isExtreme ? 99.9 : 10;

        await this.alertManager.checkAndAlert('utilization_rate', utilization, {
          asset: 'CHAOS',
        });
        await this.sleep(50);
      }

      return true;
    });

    // Test 3: Audit log integrity check
    await this.runTest('Audit Log Integrity', async () => {
      // Add some audit entries
      auditLogger.log('CHAOS_TEST_1', { value: Math.random() });
      auditLogger.log('CHAOS_TEST_2', { value: Math.random() });
      auditLogger.log('CHAOS_TEST_3', { value: Math.random() });

      // Verify the audit log
      const verification = auditLogger.verify();

      if (!verification.valid) {
        logger.error('Audit log verification failed', { errors: verification.errors });
      }

      return verification.valid;
    });

    // Test 4: Recovery simulation
    await this.runTest('Recovery After Chaos', async () => {
      // Reset to normal state
      const assets = ['DAI', 'USDC', 'WETH'];
      for (const asset of assets) {
        metricsRegistry.totalLiquidity.set({ asset }, 1000000);
        metricsRegistry.totalDebt.set({ asset }, 300000);
        metricsRegistry.utilizationRate.set({ asset }, 30);
      }

      await this.sleep(500);

      // Verify metrics are valid
      const metrics = await metricsRegistry.register.metrics();
      return metrics.includes('aave_total_liquidity');
    });

    auditLogger.log('TEST_SCENARIO_END', { scenario: 'chaos' });
  }

  private async runTest(
    name: string,
    testFn: () => Promise<boolean>
  ): Promise<void> {
    const startTime = Date.now();
    let passed = false;
    let details: string | undefined;

    try {
      passed = await testFn();
    } catch (error) {
      passed = false;
      details = error instanceof Error ? error.message : String(error);
      logger.error('Test failed with error', { name, error: details });
    }

    const duration = Date.now() - startTime;
    this.results.push({ name, passed, duration, details });

    const status = passed ? '✓ PASS' : '✗ FAIL';
    logger.info(`${status}: ${name}`, { duration: `${duration}ms` });
  }

  private printSummary(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total:  ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${totalDuration}ms`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\nFailed tests:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`  - ${r.name}${r.details ? `: ${r.details}` : ''}`);
        });
    }

    console.log('');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
