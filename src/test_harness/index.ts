import { TestHarness } from './TestHarness';
import { logger } from '../utils/logger';

async function main() {
  logger.info('=== Onchain Risk Monitor - Test Harness ===');

  const harness = new TestHarness();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const scenario = args[0] || 'all';

  try {
    switch (scenario) {
      case 'metrics':
        await harness.runMetricsSimulation();
        break;
      case 'alerts':
        await harness.runAlertSimulation();
        break;
      case 'stress':
        await harness.runStressTest();
        break;
      case 'chaos':
        await harness.runChaosSimulation();
        break;
      case 'all':
        await harness.runAllTests();
        break;
      default:
        logger.error('Unknown scenario', { scenario });
        console.log('Usage: npm run test:harness [metrics|alerts|stress|chaos|all]');
        process.exit(1);
    }

    logger.info('Test harness completed successfully');
  } catch (error) {
    logger.error('Test harness failed', { error: String(error) });
    process.exit(1);
  }
}

main();
