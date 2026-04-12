import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted() so these are available when vi.mock factories run (they are hoisted)
const { mockInit, mockCaptureException, mockWithScope, mockSetUser, mockAddBreadcrumb, mockEnv } =
  vi.hoisted(() => {
    const mockInit = vi.fn();
    const mockCaptureException = vi.fn();
    const mockWithScope = vi.fn((callback: (scope: unknown) => void) => {
      const scope = {
        setExtra: vi.fn(),
        setContext: vi.fn(),
      };
      callback(scope);
      return scope;
    });
    const mockSetUser = vi.fn();
    const mockAddBreadcrumb = vi.fn();
    const mockEnv = {
      ENABLE_SENTRY: false,
      SENTRY_DSN: '',
      NODE_ENV: 'test',
      IS_PRODUCTION: false,
      IS_DEVELOPMENT: false,
      IS_TEST: true,
      API_URL: 'http://localhost:8000/api',
      ENABLE_ANALYTICS: false,
      GA_TRACKING_ID: '',
      APP_NAME: 'Emelmujiro',
      APP_VERSION: '1.0.0',
      PUBLIC_URL: '',
    };

    return {
      mockInit,
      mockCaptureException,
      mockWithScope,
      mockSetUser,
      mockAddBreadcrumb,
      mockEnv,
    };
  });

// Mock sentry-impl (the lazy-loaded module) instead of @sentry/react directly
vi.mock('../sentry-impl', () => ({
  init: mockInit,
  captureException: mockCaptureException,
  withScope: mockWithScope,
  setUser: mockSetUser,
  addBreadcrumb: mockAddBreadcrumb,
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
  captureException,
  reportErrorBoundary,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
} from '../sentry';
import logger from '../logger';

// Flush microtask queue — needed because the lazy shim uses import().then()
async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

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
  });

  describe('initSentry', () => {
    it('should not initialize Sentry when ENABLE_SENTRY is false', async () => {
      mockEnv.ENABLE_SENTRY = false;

      initSentry();
      await flushPromises();

      expect(mockInit).not.toHaveBeenCalled();
    });

    it('should not initialize Sentry when SENTRY_DSN is empty', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = '';

      initSentry();
      await flushPromises();

      expect(mockInit).not.toHaveBeenCalled();
    });

    it('should initialize Sentry when both ENABLE_SENTRY and SENTRY_DSN are set', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();
      await flushPromises();

      expect(mockInit).toHaveBeenCalledTimes(1);
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: mockEnv.NODE_ENV,
        })
      );
    });

    it('should use 0.1 traces sample rate in production', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';
      mockEnv.NODE_ENV = 'production';

      initSentry();
      await flushPromises();

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1,
        })
      );
    });

    it('should use 1.0 traces sample rate in non-production', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';
      mockEnv.NODE_ENV = 'development';

      initSentry();
      await flushPromises();

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        })
      );
    });

    it('should include ignoreErrors list', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();
      await flushPromises();

      const callArgs = mockInit.mock.calls[0][0];
      expect(callArgs.ignoreErrors).toContain('Network request failed');
      expect(callArgs.ignoreErrors).toContain('Failed to fetch');
      expect(callArgs.ignoreErrors).toContain('ResizeObserver loop limit exceeded');
    });

    it('should include denyUrls for extensions and third-party scripts', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();
      await flushPromises();

      const callArgs = mockInit.mock.calls[0][0];
      expect(callArgs.denyUrls).toBeDefined();
      expect(callArgs.denyUrls.length).toBeGreaterThan(0);
    });

    it('should log error if lazy import fails', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';
      mockInit.mockImplementationOnce(() => {
        throw new Error('Init failed');
      });

      initSentry();
      await flushPromises();

      expect(logger.error).toHaveBeenCalledWith('Failed to initialize Sentry:', expect.any(Error));
    });

    it('should configure beforeSend to filter NetworkError', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();
      await flushPromises();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const networkEvent = {
        exception: {
          values: [{ type: 'NetworkError', value: 'test' }],
        },
      };
      expect(beforeSend(networkEvent, {})).toBeNull();
    });

    it('should configure beforeSend to filter cancelled/aborted errors', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();
      await flushPromises();

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

    it('should configure beforeSend to filter extension errors', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      initSentry();
      await flushPromises();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const extensionEvent = {
        exception: {
          values: [{ type: 'Error', value: 'Error from chrome-extension://abc' }],
        },
      };
      expect(beforeSend(extensionEvent, {})).toBeNull();
    });

    it('should configure beforeSend to pass through normal errors', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      // Ensure React DevTools hook is not present
      delete (window as unknown as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__;

      initSentry();
      await flushPromises();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const normalEvent = {
        exception: {
          values: [{ type: 'TypeError', value: 'Cannot read property' }],
        },
      };
      expect(beforeSend(normalEvent, {})).toEqual(normalEvent);
    });

    it('should filter events when React DevTools hook is present', async () => {
      mockEnv.ENABLE_SENTRY = true;
      mockEnv.SENTRY_DSN = 'https://test@sentry.io/123';

      // Set React DevTools global hook
      (window as unknown as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {};

      initSentry();
      await flushPromises();

      const callArgs = mockInit.mock.calls[0][0];
      const beforeSend = callArgs.beforeSend;

      const normalEvent = {
        exception: {
          values: [{ type: 'TypeError', value: 'Cannot read property' }],
        },
      };

      // Should return null (event filtered) because DevTools is present
      expect(beforeSend(normalEvent, {})).toBeNull();

      // Clean up
      delete (window as unknown as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__;
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

    it('should call Sentry.captureException directly without context', async () => {
      mockEnv.ENABLE_SENTRY = true;
      const error = new Error('test error');

      captureException(error);
      await flushPromises();

      expect(mockCaptureException).toHaveBeenCalledWith(error);
      expect(mockWithScope).not.toHaveBeenCalled();
    });

    it('should call Sentry.captureException with scope when context is provided', async () => {
      mockEnv.ENABLE_SENTRY = true;
      const error = new Error('test error');
      const context = { userId: '123', action: 'save' };

      captureException(error, context);
      await flushPromises();

      expect(mockWithScope).toHaveBeenCalled();
      // Verify the scope callback sets extras
      const scopeCallback = mockWithScope.mock.calls[0][0];
      const mockScope = { setExtra: vi.fn() };
      scopeCallback(mockScope);
      expect(mockScope.setExtra).toHaveBeenCalledWith('userId', '123');
      expect(mockScope.setExtra).toHaveBeenCalledWith('action', 'save');
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

    it('should capture exception with errorBoundary context when enabled', async () => {
      mockEnv.ENABLE_SENTRY = true;
      const error = new Error('render error');
      const errorInfo = {
        componentStack: '<App>\n  <Header>',
        digest: 'abc123',
      };

      reportErrorBoundary(error, errorInfo);
      await flushPromises();

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

  describe('setUserContext', () => {
    it('sets Sentry user when enabled', async () => {
      mockEnv.ENABLE_SENTRY = true;
      setUserContext({ id: 1, email: 'test@example.com' });
      await flushPromises();
      expect(mockSetUser).toHaveBeenCalledWith({ id: '1', email: 'test@example.com' });
    });

    it('does nothing when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;
      mockSetUser.mockClear();
      setUserContext({ id: 1, email: 'test@example.com' });
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe('clearUserContext', () => {
    it('clears Sentry user when enabled', async () => {
      mockEnv.ENABLE_SENTRY = true;
      clearUserContext();
      await flushPromises();
      expect(mockSetUser).toHaveBeenCalledWith(null);
    });

    it('does nothing when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;
      mockSetUser.mockClear();
      clearUserContext();
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe('addBreadcrumb', () => {
    it('adds breadcrumb when enabled', async () => {
      mockEnv.ENABLE_SENTRY = true;
      addBreadcrumb('navigation', 'User clicked home', { page: '/' });
      await flushPromises();
      expect(mockAddBreadcrumb).toHaveBeenCalledWith({
        category: 'navigation',
        message: 'User clicked home',
        data: { page: '/' },
        level: 'info',
      });
    });

    it('does nothing when Sentry is disabled', () => {
      mockEnv.ENABLE_SENTRY = false;
      mockAddBreadcrumb.mockClear();
      addBreadcrumb('test', 'msg');
      expect(mockAddBreadcrumb).not.toHaveBeenCalled();
    });
  });

  describe('default export', () => {
    it('should export all functions', async () => {
      const sentryModule = await import('../sentry');
      const defaultExport = sentryModule.default;

      expect(defaultExport.initSentry).toBe(initSentry);
      expect(defaultExport.captureException).toBe(captureException);
      expect(defaultExport.reportErrorBoundary).toBe(reportErrorBoundary);
    });
  });
});
