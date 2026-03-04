/**
 * 환경별 로깅 유틸리티
 * 프로덕션에서는 console.log를 비활성화
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

      // 프로덕션에서는 에러 리포팅 서비스로 전송
      if (!this.isDevelopment && error) {
        this.reportToErrorService(message, error);
      }
    }
  }

  // 그룹 로깅
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

  // 테이블 로깅
  table(data: unknown): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.table(data);
    }
  }

  // 성능 측정
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

  // 에러 리포팅 서비스로 전송 (Sentry)
  private reportToErrorService(message: string, error: unknown): void {
    captureException(error instanceof Error ? error : new Error(message), {
      message,
    });
  }

  // 네트워크 요청 로깅
  logRequest(method: string, url: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.group(`🌐 ${method} ${url}`);
      if (data) {
        this.debug('Request Data:', data);
      }
      this.groupEnd();
    }
  }

  // 네트워크 응답 로깅
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

// 싱글톤 인스턴스
const logger = new Logger({
  enableInProduction: getEnvVar('ENABLE_LOGGING') === 'true',
  logLevel: (getEnvVar('LOG_LEVEL') as LogLevel) || 'error',
});

export default logger;

// 개별 함수로도 export (바인딩 필요)
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const group = logger.group.bind(logger);
export const groupEnd = logger.groupEnd.bind(logger);
export const table = logger.table.bind(logger);
export const time = logger.time.bind(logger);
export const timeEnd = logger.timeEnd.bind(logger);
