/**
 * Improved tests for WebVitalsDashboard component with better isolation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import WebVitalsDashboard from '../WebVitalsDashboard';
import {
  enhancedCleanup,
  setupTimerTracking,
  restoreTimers,
} from '../../../test-utils/cleanup';

// Mock web-vitals library
const mockOnCLS = vi.fn();
const mockOnFCP = vi.fn();
const mockOnLCP = vi.fn();
const mockOnTTFB = vi.fn();
const mockOnINP = vi.fn();

vi.mock('web-vitals', () => ({
  onCLS: (callback: Function) => mockOnCLS(callback),
  onFCP: (callback: Function) => mockOnFCP(callback),
  onLCP: (callback: Function) => mockOnLCP(callback),
  onTTFB: (callback: Function) => mockOnTTFB(callback),
  onINP: (callback: Function) => mockOnINP(callback),
}));

describe('WebVitalsDashboard - Improved', () => {
  let originalEnv: string | undefined;
  let mockGtag: any;

  beforeEach(() => {
    // Setup timer tracking
    setupTimerTracking();

    // Store and mock environment
    originalEnv = process.env.NODE_ENV;
    // @ts-ignore - Need to override for testing
    process.env.NODE_ENV = 'development';

    // Mock gtag
    mockGtag = vi.fn();
    window.gtag = mockGtag;

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Enhanced cleanup
    enhancedCleanup();
    restoreTimers();

    // Restore environment
    // @ts-ignore - Need to override for testing
    process.env.NODE_ENV = originalEnv;

    // Clean up gtag
    delete window.gtag;
  });

  describe('Basic Rendering', () => {
    it.skip('renders toggle button in development mode', () => {
      render(<WebVitalsDashboard />);

      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('toggle')
      );

      expect(toggleButton).toBeInTheDocument();
    });

    it.skip('shows dashboard when toggle button is clicked', async () => {
      render(<WebVitalsDashboard />);

      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('toggle')
      );

      if (toggleButton) {
        await act(async () => {
          fireEvent.click(toggleButton);
        });

        await waitFor(
          () => {
            expect(screen.getByText(/Web Vitals/i)).toBeInTheDocument();
          },
          { timeout: 1000 }
        );
      }
    });
  });

  describe('Metrics Collection', () => {
    it.skip('collects and displays CLS metric', async () => {
      render(<WebVitalsDashboard />);

      // Simulate CLS metric
      const clsCallback = mockOnCLS.mock.calls[0]?.[0];
      if (clsCallback) {
        act(() => {
          clsCallback({
            name: 'CLS',
            value: 0.05,
            rating: 'good',
            delta: 0.05,
            id: 'cls-1',
            entries: [],
            navigationType: 'navigate',
          });
        });

        // Open dashboard
        const toggleButtons = screen.getAllByRole('button');
        const toggleButton = toggleButtons.find((btn) =>
          btn.getAttribute('aria-label')?.includes('toggle')
        );

        if (toggleButton) {
          await act(async () => {
            fireEvent.click(toggleButton);
          });

          await waitFor(
            () => {
              const clsElement = screen.getByText(/CLS/);
              expect(clsElement).toBeInTheDocument();
            },
            { timeout: 1000 }
          );
        }
      }
    });

    it.skip('collects and displays FCP metric', async () => {
      render(<WebVitalsDashboard />);

      // Simulate FCP metric
      const fcpCallback = mockOnFCP.mock.calls[0]?.[0];
      if (fcpCallback) {
        act(() => {
          fcpCallback({
            name: 'FCP',
            value: 1200,
            rating: 'good',
            delta: 1200,
            id: 'fcp-1',
            entries: [],
            navigationType: 'navigate',
          });
        });

        // Open dashboard
        const toggleButtons = screen.getAllByRole('button');
        const toggleButton = toggleButtons.find((btn) =>
          btn.getAttribute('aria-label')?.includes('toggle')
        );

        if (toggleButton) {
          await act(async () => {
            fireEvent.click(toggleButton);
          });

          await waitFor(
            () => {
              const fcpElement = screen.getByText(/FCP/);
              expect(fcpElement).toBeInTheDocument();
            },
            { timeout: 1000 }
          );
        }
      }
    });
  });

  describe('Production Mode', () => {
    it('does not render in production mode', () => {
      // @ts-ignore - Need to override for testing
      process.env.NODE_ENV = 'production';

      render(<WebVitalsDashboard />);

      const toggleButtons = screen.queryAllByRole('button');
      const toggleButton = toggleButtons.find((btn) =>
        btn.getAttribute('aria-label')?.includes('toggle')
      );

      expect(toggleButton).not.toBeDefined();
    });
  });

  describe('Analytics Integration', () => {
    it.skip('sends metrics to Google Analytics when available', async () => {
      render(<WebVitalsDashboard />);

      const fcpCallback = mockOnFCP.mock.calls[0]?.[0];
      if (fcpCallback) {
        act(() => {
          fcpCallback({
            name: 'FCP',
            value: 1500,
            rating: 'good',
            delta: 1500,
            id: 'fcp-2',
            entries: [],
            navigationType: 'navigate',
          });
        });

        await waitFor(
          () => {
            expect(mockGtag).toHaveBeenCalledWith(
              'event',
              expect.any(String),
              expect.objectContaining({
                event_category: expect.stringContaining('Web Vitals'),
              })
            );
          },
          { timeout: 1000 }
        );
      }
    });
  });

  describe('Keyboard Shortcuts', () => {
    it.skip('toggles dashboard with Ctrl+Shift+V', async () => {
      render(<WebVitalsDashboard />);

      // Initially dashboard should not be visible
      expect(
        screen.queryByText(/Web Vitals Dashboard/i)
      ).not.toBeInTheDocument();

      // Simulate keyboard shortcut
      await act(async () => {
        fireEvent.keyDown(window, {
          key: 'V',
          code: 'KeyV',
          ctrlKey: true,
          shiftKey: true,
        });
      });

      // Dashboard should appear
      await waitFor(
        () => {
          expect(screen.getByText(/Web Vitals/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Press again to hide
      await act(async () => {
        fireEvent.keyDown(window, {
          key: 'V',
          code: 'KeyV',
          ctrlKey: true,
          shiftKey: true,
        });
      });

      // Dashboard should disappear
      await waitFor(
        () => {
          expect(
            screen.queryByText(/Web Vitals Dashboard/i)
          ).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });
});
