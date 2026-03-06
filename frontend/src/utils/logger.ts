/**
 * Environment-aware logging utility
 * Disables console.log in production
 */
import { getEnvVar } from '../config/env';
import { captureException } from './sentry';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enableInProduction: boolean;
  logLevel: LogLevel;
}

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor(config?: Partial<LoggerConfig>) {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.config = {
      enableInProduction: false,
      logLevel: 'warn', // Only show warnings and errors by default
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && !this.config.enableInProduction) {
      return false;
    }

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    _data?: unknown
  ): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message), data || '');
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('info', message), data || '');
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), data || '');
    }
  }

  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), error || '');

      // Send to error reporting service in production
      if (!this.isDevelopment && error) {
        this.reportToErrorService(message, error);
      }
    }
  }

  // Group logging
  group(label: string): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  // Table logging
  table(data: unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.table(data);
    }
  }

  // Performance measurement
  time(label: string): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.timeEnd(label);
    }
  }

  // Send to error reporting service (Sentry)
  private reportToErrorService(message: string, error: unknown): void {
    captureException(error instanceof Error ? error : new Error(message), {
      message,
    });
  }

  // Network request logging
  logRequest(method: string, url: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.group(`🌐 ${method} ${url}`);
      if (data) {
        this.debug('Request Data:', data);
      }
      this.groupEnd();
    }
  }

  // Network response logging
  logResponse(
    method: string,
    url: string,
    status: number,
    data?: unknown
  ): void {
    if (this.isDevelopment) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      this.group(`${emoji} ${method} ${url} - ${status}`);
      if (data) {
        this.debug('Response Data:', data);
      }
      this.groupEnd();
    }
  }
}

// Singleton instance
const logger = new Logger({
  enableInProduction: getEnvVar('ENABLE_LOGGING') === 'true',
  logLevel: (getEnvVar('LOG_LEVEL') as LogLevel) || 'error',
});

export default logger;
