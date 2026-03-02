import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() so these are available when vi.mock factories run (they are hoisted)
const {
  mockInit,
  mockSetUser,
  mockSetContext,
  mockCaptureException,
  mockCaptureMessage,
  mockAddBreadcrumb,
  mockWithScope,
  mockStartSpan,
  mockFlush,
  mockEnv,
} = vi.hoisted(() => {
  const mockInit = vi.fn();
  const mockSetUser = vi.fn();
  const mockSetContext = vi.fn();
  const mockCaptureException = vi.fn();
  const mockCaptureMessage = vi.fn();
  const mockAddBreadcrumb = vi.fn();
  const mockWithScope = vi.fn((callback: (scope: unknown) => void) => {
    const scope = {
      setExtra: vi.fn(),
      setContext: vi.fn(),
    };
    callback(scope);
    return scope;
  });
  const mockStartSpan = vi.fn(
    (_options: unknown, callback: () => void | Promise<void>) => {
      return callback();
    }
  );
  const mockFlush = vi.fn().mockResolvedValue(true);
  const mockEnv = {
    ENABLE_SENTRY: false,
    SENTRY_DSN: '',
    NODE_ENV: 'test',
    IS_PRODUCTION: false,
    IS_DEVELOPMENT: false,
    IS_TEST: true,
    API_URL: 'http://localhost:8000/api',
    WS_URL: 'ws://localhost:8000/ws',
    ENABLE_ANALYTICS: false,
    ENABLE_PWA: false,
    GA_TRACKING_ID: '',
    VAPID_PUBLIC_KEY: '',
    APP_NAME: 'Emelmujiro',
    APP_VERSION: '1.0.0',
    PUBLIC_URL: '/emelmujiro',
  };

  return {
    mockInit,
    mockSetUser,
    mockSetContext,
    mockCaptureException,
    mockCaptureMessage,
    mockAddBreadcrumb,
    mockWithScope,
    mockStartSpan,
    mockFlush,
    mockEnv,
  };
});

// Mock @sentry/react
vi.mock('@sentry/react', () => ({
  init: mockInit,
  setUser: mockSetUser,
  setContext: mockSetContext,
  captureException: mockCaptureException,
  captureMessage: mockCaptureMessage,
  addBreadcrumb: mockAddBreadcrumb,
  withScope: mockWithScope,
  startSpan: mockStartSpan,
  flush: mockFlush,
}));

// Mock logger to prevent console output
vi.mock('../logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock env module
vi.mock('../../config/env', () => ({
  default: mockEnv,
  env: mockEnv,
}));

// Import after mocks
import {
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
} from '../sentry';
import logger from '../logger';

describe('sentry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env to disabled state
    mockEnv.ENABLE_SENTRY = false;
    mockEnv.SENTRY_DSN = '';
    mockEnv.NODE_ENV = 'test';

    // Restore default implementations after clearAllMocks
    mockWithScope.mockImplementation((callback: (scope: unknown) => void) => {
      const scope = {
        setExtra: vi.fn(),
        setContext: vi.fn(),
      };
      callback(scope);
      return scope;
    });
    mockStartSpan.mockImplementation(
      (_options: unknown, callback: () => void | Promise<void>) => {
        return callback();
      }
    );
    mockFlush.mockResolvedValue(true);
  });

  describe('initSentry', () => {
    it('should not initialize Sentry when ENABLE_SENTRY is false', () => {
      mockEnv.ENABLE_SENTRY = false;

      initSentry();

      expect(mockInit).not.toHaveBeenCalled();
    });

    it('should not initialize Sentry when SENTRY_DSN is empty', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = '';

      initSentry();

      expect(mockInit).not.toHaveBeenCalled();
    });

    it('should initialize Sentry when both ENABLE_SENTRY and SENTRY_DSN are set', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();

      expect(mockInit).toHaveBeenCalledTimes(1);
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: mockEnv.NODE_ENV,
        })
      );
    });

    it('should use 0.1 traces sample rate in production', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';
      mockEnv.NODE_ENV = 'production';

      initSentry();

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1,
        })
      );
    });

    it('should use 1.0 traces sample rate in non-production', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';
      mockEnv.NODE_ENV = 'development';

      initSentry();

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        })
      );
    });

    it('should include ignoreErrors list', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();

      const callArgs = mockInit.mock.calls[0][0];
      expect(callArgs.ignoreErrors).toContain('Network request failed');
      expect(callArgs.ignoreErrors).toContain('Failed to fetch');
      expect(callArgs.ignoreErrors).toContain(
        'ResizeObserver loop limit exceeded'
      );
    });

    it('should include denyUrls for extensions and third-party scripts', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();

      const callArgs = mockInit.mock.calls[0][0];
      expect(callArgs.denyUrls).toBeDefined();
      expect(callArgs.denyUrls.length).toBeGreaterThan(0);
    });

    it('should log error if Sentry init throws', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';
      mockInit.mockImplementationOnce(() => {
        throw new Error('Init failed');
      });

      initSentry();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize Sentry:',
        expect.any(Error)
      );
    });

    it('should configure beforeSend to filter NetworkError', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const networkEvent = {
        exception: {
          values: [{ type: 'NetworkError', value: 'test' }],
        },
      };
      expect(beforeSend(networkEvent, {})).toBeNull();
    });

    it('should configure beforeSend to filter cancelled/aborted errors', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const cancelledEvent = {
        exception: {
          values: [{ type: 'Error', value: 'Request cancelled by user' }],
        },
      };
      expect(beforeSend(cancelledEvent, {})).toBeNull();

      const abortedEvent = {
        exception: {
          values: [{ type: 'Error', value: 'Request aborted' }],
        },
      };
      expect(beforeSend(abortedEvent, {})).toBeNull();
    });

    it('should configure beforeSend to filter extension errors', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const extensionEvent = {
        exception: {
          values: [
            { type: 'Error', value: 'Error from chrome-extension://abc' },
          ],
        },
      };
      expect(beforeSend(extensionEvent, {})).toBeNull();
    });

    it('should configure beforeSend to pass through normal errors', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      // Ensure React DevTools hook is not present
      delete (window as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__;

      initSentry();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const normalEvent = {
        exception: {
          values: [{ type: 'TypeError', value: 'Cannot read property' }],
        },
      };
      expect(beforeSend(normalEvent, {})).toEqual(normalEvent);
    });
  });

  describe('setSentryUser', () => {
    it('should not call Sentry.setUser when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;

      setSentryUser({ id: '1', email: 'test@test.com' });

      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it('should call Sentry.setUser when Sentry is enabled', () => {
      mockEnv.ENABLE_SENTRY = true;
      const user = { id: '1', email: 'test@test.com', username: 'tester' };

      setSentryUser(user);

      expect(mockSetUser).toHaveBeenCalledWith(user);
    });

    it('should call Sentry.setUser with null to clear user', () => {
      mockEnv.ENABLE_SENTRY = true;

      setSentryUser(null);

      expect(mockSetUser).toHaveBeenCalledWith(null);
    });
  });

  describe('setSentryContext', () => {
    it('should not call Sentry.setContext when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;

      setSentryContext('page', { name: 'home' });

      expect(mockSetContext).not.toHaveBeenCalled();
    });

    it('should call Sentry.setContext when Sentry is enabled', () => {
      mockEnv.ENABLE_SENTRY = true;
      const context = { name: 'home', path: '/' };

      setSentryContext('page', context);

      expect(mockSetContext).toHaveBeenCalledWith('page', context);
    });
  });

  describe('captureException', () => {
    it('should not call Sentry.captureException when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;

      captureException(new Error('test error'));

      expect(mockCaptureException).not.toHaveBeenCalled();
    });

    it('should log error to logger when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;
      const error = new Error('test error');

      captureException(error);

      expect(logger.error).toHaveBeenCalledWith('Error captured:', {
        error,
        context: undefined,
      });
    });

    it('should call Sentry.captureException directly without context', () => {
      mockEnv.ENABLE_SENTRY = true;
      const error = new Error('test error');

      captureException(error);

      expect(mockCaptureException).toHaveBeenCalledWith(error);
      expect(mockWithScope).not.toHaveBeenCalled();
    });

    it('should call Sentry.captureException with scope when context is provided', () => {
      mockEnv.ENABLE_SENTRY = true;
      const error = new Error('test error');
      const context = { userId: '123', action: 'save' };

      captureException(error, context);

      expect(mockWithScope).toHaveBeenCalled();
      // Verify the scope callback sets extras
      const scopeCallback = mockWithScope.mock.calls[0][0];
      const mockScope = { setExtra: vi.fn() };
      scopeCallback(mockScope);
      expect(mockScope.setExtra).toHaveBeenCalledWith('userId', '123');
      expect(mockScope.setExtra).toHaveBeenCalledWith('action', 'save');
    });
  });

  describe('captureMessage', () => {
    it('should not call Sentry.captureMessage when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;

      captureMessage('test message');

      expect(mockCaptureMessage).not.toHaveBeenCalled();
    });

    it('should log message to logger when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;

      captureMessage('test message', 'warning');

      expect(logger.info).toHaveBeenCalledWith(
        '[WARNING] test message',
        undefined
      );
    });

    it('should call Sentry.captureMessage directly without context', () => {
      mockEnv.ENABLE_SENTRY = true;

      captureMessage('test message', 'info');

      expect(mockCaptureMessage).toHaveBeenCalledWith('test message', 'info');
      expect(mockWithScope).not.toHaveBeenCalled();
    });

    it('should use info as default severity level', () => {
      mockEnv.ENABLE_SENTRY = true;

      captureMessage('test message');

      expect(mockCaptureMessage).toHaveBeenCalledWith('test message', 'info');
    });

    it('should call Sentry.captureMessage with scope when context is provided', () => {
      mockEnv.ENABLE_SENTRY = true;
      const context = { page: 'home' };

      captureMessage('test message', 'warning', context);

      expect(mockWithScope).toHaveBeenCalled();
      const scopeCallback = mockWithScope.mock.calls[0][0];
      const mockScope = { setExtra: vi.fn() };
      scopeCallback(mockScope);
      expect(mockScope.setExtra).toHaveBeenCalledWith('page', 'home');
    });
  });

  describe('addBreadcrumb', () => {
    it('should not call Sentry.addBreadcrumb when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;

      addBreadcrumb({ message: 'navigated', category: 'navigation' });

      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });

    it('should call Sentry.addBreadcrumb when Sentry is enabled', () => {
      mockEnv.ENABLE_SENTRY = true;
      const breadcrumb = {
        message: 'navigated to /about',
        category: 'navigation',
        level: 'info' as const,
        data: { from: '/', to: '/about' },
      };

      addBreadcrumb(breadcrumb);

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });
  });

  describe('startTransaction', () => {
    it('should return null when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;

      const result = startTransaction('test-transaction', 'navigation');

      expect(result).toBeNull();
      expect(mockStartSpan).not.toHaveBeenCalled();
    });

    it('should call Sentry.startSpan and return name when Sentry is enabled', () => {
      mockEnv.ENABLE_SENTRY = true;

      const result = startTransaction('test-transaction', 'navigation');

      expect(mockStartSpan).toHaveBeenCalledWith(
        { name: 'test-transaction', op: 'navigation' },
        expect.any(Function)
      );
      expect(result).toBe('test-transaction');
    });

    it('should return null and log warning if startSpan throws', () => {
      mockEnv.ENABLE_SENTRY = true;
      mockStartSpan.mockImplementationOnce(() => {
        throw new Error('Span failed');
      });

      const result = startTransaction('failing-transaction', 'custom');

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to start transaction:',
        expect.any(Error)
      );
    });
  });

  describe('reportErrorBoundary', () => {
    it('should not call Sentry when disabled', () => {
      mockEnv.ENABLE_SENTRY = false;
      const error = new Error('render error');
      const errorInfo = { componentStack: '<App>' };

      reportErrorBoundary(error, errorInfo);

      expect(mockWithScope).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Error Boundary:', {
        error,
        errorInfo,
      });
    });

    it('should capture exception with errorBoundary context when enabled', () => {
      mockEnv.ENABLE_SENTRY = true;
      const error = new Error('render error');
      const errorInfo = {
        componentStack: '<App>\n  <Header>',
        digest: 'abc123',
      };

      reportErrorBoundary(error, errorInfo);

      expect(mockWithScope).toHaveBeenCalled();
      const scopeCallback = mockWithScope.mock.calls[0][0];
      const mockScope = { setContext: vi.fn() };
      scopeCallback(mockScope);
      expect(mockScope.setContext).toHaveBeenCalledWith('errorBoundary', {
        componentStack: '<App>\n  <Header>',
        digest: 'abc123',
      });
      expect(mockCaptureException).toHaveBeenCalledWith(error);
    });
  });

  describe('measurePerformance', () => {
    it('should execute callback even when Sentry is disabled', async () => {
      mockEnv.ENABLE_SENTRY = false;
      const callback = vi.fn();

      measurePerformance('test-op', callback);

      // Wait for the Promise.resolve(callback()) to settle
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should use Sentry.startSpan when enabled', () => {
      mockEnv.ENABLE_SENTRY = true;
      const callback = vi.fn();

      measurePerformance('test-op', callback);

      expect(mockStartSpan).toHaveBeenCalledWith(
        { name: 'test-op', op: 'custom' },
        expect.any(Function)
      );
    });
  });

  describe('flushSentry', () => {
    it('should not call Sentry.flush when Sentry is disabled', async () => {
      mockEnv.ENABLE_SENTRY = false;

      await flushSentry();

      expect(mockFlush).not.toHaveBeenCalled();
    });

    it('should call Sentry.flush with 2000ms timeout when enabled', async () => {
      mockEnv.ENABLE_SENTRY = true;

      await flushSentry();

      expect(mockFlush).toHaveBeenCalledWith(2000);
    });
  });

  describe('default export', () => {
    it('should export all functions', async () => {
      const sentryModule = await import('../sentry');
      const defaultExport = sentryModule.default;

      expect(defaultExport.initSentry).toBe(initSentry);
      expect(defaultExport.setSentryUser).toBe(setSentryUser);
      expect(defaultExport.setSentryContext).toBe(setSentryContext);
      expect(defaultExport.captureException).toBe(captureException);
      expect(defaultExport.captureMessage).toBe(captureMessage);
      expect(defaultExport.addBreadcrumb).toBe(addBreadcrumb);
      expect(defaultExport.startTransaction).toBe(startTransaction);
      expect(defaultExport.reportErrorBoundary).toBe(reportErrorBoundary);
      expect(defaultExport.measurePerformance).toBe(measurePerformance);
      expect(defaultExport.flushSentry).toBe(flushSentry);
    });
  });
});
