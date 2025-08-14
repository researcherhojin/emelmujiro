// Sentry 초기화 및 에러 트래킹 유틸리티
// 프로덕션 환경에서만 실제 Sentry를 로드하고 사용

/**
 * Sentry 초기화 및 설정
 * 프로덕션 환경에서만 동적으로 Sentry를 로드
 */
export const initSentry = async () => {
  // 프로덕션 환경에서만 Sentry 활성화
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.REACT_APP_SENTRY_DSN &&
    process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true'
  ) {
    try {
      // Dynamic import of Sentry modules
      const Sentry = await import('@sentry/react');

      Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || 'production',
        release:
          process.env.REACT_APP_SENTRY_RELEASE ||
          process.env.REACT_APP_APP_VERSION,

        integrations: [
          // Default integrations will be automatically included
        ],

        // 성능 모니터링
        tracesSampleRate: 0.1,

        // 세션 리플레이
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // 에러 필터링
        beforeSend(event, _hint) {
          // 개발자 도구가 열려있을 때 에러 무시
          if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
            return null;
          }

          // 네트워크 에러 필터링
          if (event.exception?.values?.[0]?.type === 'NetworkError') {
            return null;
          }

          // 취소된 요청 무시
          if (event.message?.includes('AbortError')) {
            return null;
          }

          // 브라우저 확장 프로그램 에러 무시
          if (
            event.exception?.values?.[0]?.stacktrace?.frames?.some(
              (frame) =>
                frame.filename?.includes('chrome-extension://') ||
                frame.filename?.includes('moz-extension://')
            )
          ) {
            return null;
          }

          // 민감한 정보 제거
          if (event.request?.cookies) {
            delete event.request.cookies;
          }
          if (event.user?.email) {
            event.user.email = '***';
          }

          return event;
        },

        // 브레드크럼 필터링
        beforeBreadcrumb(breadcrumb, _hint) {
          // 민감한 정보가 포함된 브레드크럼 제거
          if (
            breadcrumb.category === 'console' &&
            breadcrumb.level === 'debug'
          ) {
            return null;
          }

          // XHR 요청에서 민감한 헤더 제거
          if (breadcrumb.category === 'xhr' && breadcrumb.data?.headers) {
            delete breadcrumb.data.headers.Authorization;
            delete breadcrumb.data.headers.Cookie;
          }

          return breadcrumb;
        },

        // 에러 무시 목록
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',
          'Network request failed',
          'NetworkError',
          'Failed to fetch',
          'User cancelled',
          'User denied',
          'Extension context invalidated',
          'chrome-extension',
          'moz-extension',
        ],

        // 초기 스코프 설정
        initialScope: {
          tags: {
            component: 'frontend',
            version: process.env.REACT_APP_APP_VERSION,
          },
          user: {
            id: localStorage.getItem('userId') || 'anonymous',
          },
        },
      });

      // 추가 컨텍스트 설정
      Sentry.setContext('app', {
        name: process.env.REACT_APP_APP_NAME,
        version: process.env.REACT_APP_APP_VERSION,
        environment: process.env.REACT_APP_ENV,
      });

      // 전역 Sentry 객체 설정
      (window as any).Sentry = Sentry;

      // Sentry initialized successfully
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }
};

/**
 * 사용자 정보 설정
 */
export const setSentryUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  if ((window as any).Sentry) {
    (window as any).Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }
};

/**
 * 사용자 정보 초기화
 */
export const clearSentryUser = () => {
  if ((window as any).Sentry) {
    (window as any).Sentry.setUser(null);
  }
};

/**
 * 커스텀 에러 리포팅
 */
export const reportError = (error: Error, context?: Record<string, any>) => {
  console.error('Error reported:', error, context);

  if ((window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  }
};

/**
 * 커스텀 메시지 리포팅
 */
export const reportMessage = (
  message: string,
  level: string = 'info',
  context?: Record<string, any>
) => {
  if ((window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, {
      level,
      contexts: {
        custom: context,
      },
    });
  }
};

/**
 * 성능 트랜잭션 시작
 */
export const startTransaction = (name: string, op: string = 'navigation') => {
  if ((window as any).Sentry) {
    return (window as any).Sentry.startTransaction({
      name,
      op,
    });
  }
  return null;
};

/**
 * 브레드크럼 추가
 */
export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: string;
  data?: Record<string, any>;
}) => {
  if ((window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'custom',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1000,
    });
  }
};

export default {
  initSentry,
  setSentryUser,
  clearSentryUser,
  reportError,
  reportMessage,
  startTransaction,
  addBreadcrumb,
};
