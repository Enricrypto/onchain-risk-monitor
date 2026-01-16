import winston from 'winston';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { AuditLogEntry } from '../types';

// Ensure logs directory exists
const logsDir = path.dirname(config.logFilePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured logging
const structuredFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
  return `${timestamp} [${level.toUpperCase()}] ${message} ${meta}`;
});

// Main application logger
export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    structuredFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        structuredFormat
      ),
    }),
    // File transport
    new winston.transports.File({
      filename: config.logFilePath,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    // Separate error log
    new winston.transports.File({
      filename: config.logFilePath.replace('.log', '.error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// Audit logger for hash-verified audit trails
class AuditLogger {
  private auditFilePath: string;
  private previousHash: string = '0'.repeat(64);

  constructor() {
    this.auditFilePath = config.logFilePath.replace('.log', '.audit.jsonl');
    this.loadPreviousHash();
  }

  private loadPreviousHash(): void {
    try {
      if (fs.existsSync(this.auditFilePath)) {
        const content = fs.readFileSync(this.auditFilePath, 'utf8');
        const lines = content.trim().split('\n').filter(Boolean);
        if (lines.length > 0) {
          const lastEntry = JSON.parse(lines[lines.length - 1]) as AuditLogEntry;
          this.previousHash = lastEntry.hash;
        }
      }
    } catch (error) {
      logger.warn('Could not load previous audit hash, starting fresh', { error });
    }
  }

  private computeHash(entry: Omit<AuditLogEntry, 'hash'>): string {
    const data = JSON.stringify({
      timestamp: entry.timestamp,
      action: entry.action,
      details: entry.details,
      previousHash: entry.previousHash,
    });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  log(action: string, details: Record<string, unknown>): AuditLogEntry {
    const timestamp = Date.now();
    const entryWithoutHash = {
      timestamp,
      action,
      details,
      previousHash: this.previousHash,
    };

    const hash = this.computeHash(entryWithoutHash);
    const entry: AuditLogEntry = { ...entryWithoutHash, hash };

    // Write to audit file
    fs.appendFileSync(this.auditFilePath, JSON.stringify(entry) + '\n');

    // Update previous hash for next entry
    this.previousHash = hash;

    logger.debug('Audit log entry created', { action, hash: hash.substring(0, 16) });

    return entry;
  }

  verify(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      if (!fs.existsSync(this.auditFilePath)) {
        return { valid: true, errors: [] };
      }

      const content = fs.readFileSync(this.auditFilePath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);

      let expectedPreviousHash = '0'.repeat(64);

      for (let i = 0; i < lines.length; i++) {
        const entry = JSON.parse(lines[i]) as AuditLogEntry;

        // Verify chain link
        if (entry.previousHash !== expectedPreviousHash) {
          errors.push(`Chain broken at entry ${i}: expected previousHash ${expectedPreviousHash.substring(0, 16)}, got ${entry.previousHash.substring(0, 16)}`);
        }

        // Verify hash
        const computedHash = this.computeHash({
          timestamp: entry.timestamp,
          action: entry.action,
          details: entry.details,
          previousHash: entry.previousHash,
        });

        if (computedHash !== entry.hash) {
          errors.push(`Hash mismatch at entry ${i}: computed ${computedHash.substring(0, 16)}, stored ${entry.hash.substring(0, 16)}`);
        }

        expectedPreviousHash = entry.hash;
      }

      logger.info(`Audit log verification completed: ${lines.length} entries, ${errors.length} errors`);
    } catch (error) {
      errors.push(`Verification failed: ${error}`);
    }

    return { valid: errors.length === 0, errors };
  }
}

export const auditLogger = new AuditLogger();
