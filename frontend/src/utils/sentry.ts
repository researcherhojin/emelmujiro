import * as Sentry from '@sentry/react';
import env from '../config/env';

// Type definitions for better type safety
interface WindowWithDevTools extends Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
}

interface ErrorInfo {
  componentStack?: string;
  digest?: string;
}

// Sentry 초기화
export function initSentry(): void {
  if (env.ENABLE_SENTRY && env.SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // 에러 필터링
        beforeSend(event, _hint) {
          // 개발자 도구가 열려있을 때 에러 무시
          if ((window as WindowWithDevTools).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            return null;
          }

          // 네트워크 에러 필터링
          if (event.exception?.values?.[0]?.type === 'NetworkError') {
            return null;
          }

          // 사용자 취소 에러 필터링
          if (
            event.exception?.values?.[0]?.value?.includes('cancelled') ||
            event.exception?.values?.[0]?.value?.includes('aborted')
          ) {
            return null;
          }

          // 확장 프로그램으로 인한 에러 필터링
          if (
            event.exception?.values?.[0]?.value?.includes('extension://') ||
            event.exception?.values?.[0]?.value?.includes('chrome-extension://')
          ) {
            return null;
          }

          return event;
        },

        // 무시할 에러들
        ignoreErrors: [
          // 네트워크 관련
          'Network request failed',
          'NetworkError',
          'Failed to fetch',
          'Load failed',
          'The request timed out',

          // 사용자 액션
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',

          // 브라우저 확장 프로그램
          'extension://',
          'chrome-extension://',
          'moz-extension://',

          // 알려진 서드파티 에러
          'top.GLOBALS',
          'grecaptcha',
          'fb_xd_fragment',
          '__tcfapi',

          // Service Worker
          'Failed to register a ServiceWorker',
          'No matching service worker detected',
        ],

        // 블랙리스트 URL
        denyUrls: [
          // 브라우저 확장 프로그램
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
          /^moz-extension:\/\//i,

          // 서드파티 스크립트
          /graph\.facebook\.com/i,
          /connect\.facebook\.net/i,
          /google-analytics\.com/i,
          /googletagmanager\.com/i,
          /doubleclick\.net/i,
        ],
      });

      // Sentry initialized successfully
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }
}

// 사용자 컨텍스트 설정
export function setSentryUser(
  user: {
    id?: string;
    email?: string;
    username?: string;
  } | null
): void {
  if (env.ENABLE_SENTRY) {
    Sentry.setUser(user);
  }
}

// 추가 컨텍스트 설정
export function setSentryContext(
  key: string,
  context: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    Sentry.setContext(key, context);
  }
}

// 에러 캡처
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    if (context) {
      Sentry.withScope((scope) => {
        Object.keys(context).forEach((key) => {
          scope.setExtra(key, context[key]);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } else {
    // 개발 환경에서는 콘솔에 출력
    console.error('Error captured:', error, context);
  }
}

// 메시지 캡처
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): void {
  if (env.ENABLE_SENTRY) {
    if (context) {
      Sentry.withScope((scope) => {
        Object.keys(context).forEach((key) => {
          scope.setExtra(key, context[key]);
        });
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }
  } else {
    // 개발 환경에서는 콘솔에 출력
    // eslint-disable-next-line no-console
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

// 브레드크럼 추가
export function addBreadcrumb(breadcrumb: {
  message?: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
  timestamp?: number;
}): void {
  if (env.ENABLE_SENTRY) {
    Sentry.addBreadcrumb(breadcrumb);
  }
}

// 트랜잭션 시작
export function startTransaction(name: string, op: string): string | null {
  if (env.ENABLE_SENTRY) {
    try {
      // Sentry v7+ 방식으로 트랜잭션 시작
      Sentry.startSpan(
        {
          name,
          op,
        },
        () => {
          // 스팬 내부에서 실행할 작업이 있다면 여기에 추가
        }
      );

      return name;
    } catch (error) {
      console.warn('Failed to start transaction:', error);
      return null;
    }
  }
  return null;
}

// React Error Boundary와 함께 사용할 에러 리포터
export function reportErrorBoundary(error: Error, errorInfo: ErrorInfo): void {
  if (env.ENABLE_SENTRY) {
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        componentStack: errorInfo.componentStack,
        digest: errorInfo.digest,
      });
      Sentry.captureException(error);
    });
  } else {
    console.error('Error Boundary:', error, errorInfo);
  }
}

// 성능 모니터링
export function measurePerformance(
  name: string,
  callback: () => void | Promise<void>
): void {
  if (env.ENABLE_SENTRY) {
    Sentry.startSpan({ name, op: 'custom' }, async () => {
      try {
        await callback();
      } catch (error) {
        captureException(error, { operation: name });
        throw error;
      }
    });
  } else {
    // Sentry가 비활성화된 경우에도 콜백 실행
    Promise.resolve(callback()).catch((error) => {
      console.error(`Performance measurement failed for ${name}:`, error);
    });
  }
}

// Sentry 플러시 (앱 종료 시 사용)
export async function flushSentry(): Promise<void> {
  if (env.ENABLE_SENTRY) {
    await Sentry.flush(2000);
  }
}

// 기본 내보내기
const sentryUtils = {
  initSentry,
  setSentryUser,
  setSentryContext,
  captureException,
  captureMessage,
  addBreadcrumb,
  startTransaction,
  reportErrorBoundary,
  measurePerformance,
  flushSentry,
};

export default sentryUtils;
