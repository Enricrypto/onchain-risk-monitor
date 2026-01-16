import express, { Request, Response } from 'express';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { metricsRegistry } from './registry';

let server: ReturnType<typeof express.application.listen> | null = null;

export async function startMetricsServer(): Promise<void> {
  const app = express();

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: Date.now() });
  });

  // Prometheus metrics endpoint
  app.get(config.metricsPath, async (req: Request, res: Response) => {
    try {
      res.set('Content-Type', metricsRegistry.register.contentType);
      const metrics = await metricsRegistry.register.metrics();
      res.end(metrics);
    } catch (error) {
      logger.error('Error generating metrics', { error: String(error) });
      res.status(500).end('Error generating metrics');
    }
  });

  // Status endpoint
  app.get('/status', (req: Request, res: Response) => {
    res.json({
      status: 'running',
      network: config.networkName,
      chainId: config.chainId,
      timestamp: Date.now(),
    });
  });

  return new Promise((resolve, reject) => {
    server = app.listen(config.metricsPort, () => {
      logger.info('Metrics server started', {
        port: config.metricsPort,
        metricsPath: config.metricsPath,
      });
      resolve();
    });

    server.on('error', (error) => {
      logger.error('Metrics server error', { error: String(error) });
      reject(error);
    });
  });
}

export async function stopMetricsServer(): Promise<void> {
  if (server) {
    return new Promise((resolve) => {
      server!.close(() => {
        logger.info('Metrics server stopped');
        server = null;
        resolve();
      });
    });
  }
}
