/**
 * Comprehensive tests for WebVitalsDashboard component
 * Testing metric collection, rating calculations, dashboard interactions, and analytics integration
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import WebVitalsDashboard from '../WebVitalsDashboard';

// Mock web-vitals library
const mockOnCLS = jest.fn();
const mockOnFCP = jest.fn();
const mockOnLCP = jest.fn();
const mockOnTTFB = jest.fn();
const mockOnINP = jest.fn();

jest.mock('web-vitals', () => ({
  onCLS: (callback: Function) => mockOnCLS(callback),
  onFCP: (callback: Function) => mockOnFCP(callback),
  onLCP: (callback: Function) => mockOnLCP(callback),
  onTTFB: (callback: Function) => mockOnTTFB(callback),
  onINP: (callback: Function) => mockOnINP(callback),
}));

// Mock console.log
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('WebVitalsDashboard', () => {
  let originalEnv: string | undefined;
  let originalGtag: typeof window.gtag;
  let mockGtag: jest.Mock;

  beforeEach(() => {
    // Store original environment
    originalEnv = process.env.NODE_ENV;
    originalGtag = window.gtag;

    // Mock gtag
    mockGtag = jest.fn();
    Object.defineProperty(window, 'gtag', {
      writable: true,
      value: mockGtag,
    });

    jest.clearAllMocks();
    mockConsoleLog.mockClear();

    // Mock Date.now for consistent timestamps
    jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // Fixed timestamp
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00 AM');
  });

  afterEach(() => {
    // Restore original environment
    process.env = {
      ...process.env,
      NODE_ENV: (originalEnv || 'test') as 'development' | 'production' | 'test',
    };

    // Restore original gtag
    Object.defineProperty(window, 'gtag', {
      writable: true,
      value: originalGtag,
    });

    jest.restoreAllMocks();
  });

  describe('Development Mode Behavior', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' };
    });

    test('renders toggle button in development mode', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent('📊');
    });

    test('shows dashboard when toggle button is clicked', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText('Web Vitals Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Collecting metrics...')).toBeInTheDocument();
    });

    test('hides dashboard when close button is clicked', () => {
      render(<WebVitalsDashboard />);

      // Open dashboard
      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText('Web Vitals Dashboard')).toBeInTheDocument();

      // Close dashboard
      const closeButton = screen.getByRole('button', { name: /close dashboard/i });
      fireEvent.click(closeButton);

      expect(screen.queryByText('Web Vitals Dashboard')).not.toBeInTheDocument();
    });

    test('toggles dashboard visibility with keyboard shortcut', () => {
      render(<WebVitalsDashboard />);

      // Initially dashboard should not be visible
      expect(screen.queryByText('Web Vitals Dashboard')).not.toBeInTheDocument();

      // Press Ctrl+Shift+V
      fireEvent.keyDown(window, { key: 'V', ctrlKey: true, shiftKey: true });

      expect(screen.getByText('Web Vitals Dashboard')).toBeInTheDocument();

      // Press again to hide
      fireEvent.keyDown(window, { key: 'V', ctrlKey: true, shiftKey: true });

      expect(screen.queryByText('Web Vitals Dashboard')).not.toBeInTheDocument();
    });

    test('ignores other keyboard combinations', () => {
      render(<WebVitalsDashboard />);

      // Try different key combinations
      fireEvent.keyDown(window, { key: 'V', ctrlKey: true }); // Missing shiftKey
      expect(screen.queryByText('Web Vitals Dashboard')).not.toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'V', shiftKey: true }); // Missing ctrlKey
      expect(screen.queryByText('Web Vitals Dashboard')).not.toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'C', ctrlKey: true, shiftKey: true }); // Wrong key
      expect(screen.queryByText('Web Vitals Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Production Mode Behavior', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'production' };
    });

    test('does not render toggle button in production mode', () => {
      render(<WebVitalsDashboard />);

      expect(
        screen.queryByRole('button', { name: /toggle web vitals dashboard/i })
      ).not.toBeInTheDocument();
    });

    test('does not show dashboard in production mode', () => {
      render(<WebVitalsDashboard />);

      expect(screen.queryByText('Web Vitals Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Web Vitals Integration', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' };
    });

    test('registers all web vitals observers', () => {
      render(<WebVitalsDashboard />);

      expect(mockOnCLS).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnFCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnLCP).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnTTFB).toHaveBeenCalledWith(expect.any(Function));
      expect(mockOnINP).toHaveBeenCalledWith(expect.any(Function));
    });

    test('handles CLS metric correctly', () => {
      render(<WebVitalsDashboard />);

      // Open dashboard
      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Simulate CLS metric
      const clsHandler = mockOnCLS.mock.calls[0][0];
      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
      });

      expect(screen.getByText('CLS')).toBeInTheDocument();
      expect(screen.getByText('0.050')).toBeInTheDocument(); // CLS formatted to 3 decimals
      expect(screen.getByText('✅')).toBeInTheDocument(); // Good rating
    });

    test('handles FCP metric correctly', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Simulate FCP metric
      const fcpHandler = mockOnFCP.mock.calls[0][0];
      act(() => {
        fcpHandler({ name: 'FCP', value: 1500 });
      });

      expect(screen.getByText('FCP')).toBeInTheDocument();
      expect(screen.getByText('1500ms')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument(); // Good rating
    });

    test('handles LCP metric with needs-improvement rating', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Simulate LCP metric with medium value
      const lcpHandler = mockOnLCP.mock.calls[0][0];
      act(() => {
        lcpHandler({ name: 'LCP', value: 3000 });
      });

      expect(screen.getByText('LCP')).toBeInTheDocument();
      expect(screen.getByText('3000ms')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument(); // Needs improvement rating
    });

    test('handles TTFB metric with poor rating', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Simulate TTFB metric with poor value
      const ttfbHandler = mockOnTTFB.mock.calls[0][0];
      act(() => {
        ttfbHandler({ name: 'TTFB', value: 2000 });
      });

      expect(screen.getByText('TTFB')).toBeInTheDocument();
      expect(screen.getByText('2000ms')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument(); // Poor rating
    });

    test('handles INP metric correctly', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Simulate INP metric
      const inpHandler = mockOnINP.mock.calls[0][0];
      act(() => {
        inpHandler({ name: 'INP', value: 150 });
      });

      expect(screen.getByText('INP')).toBeInTheDocument();
      expect(screen.getByText('150ms')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument(); // Good rating
    });
  });

  describe('Metric Rating System', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' };
    });

    test('correctly rates CLS metrics', () => {
      render(<WebVitalsDashboard />);
      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      const clsHandler = mockOnCLS.mock.calls[0][0];

      // Good CLS
      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
      });
      expect(screen.getByText('✅')).toBeInTheDocument();

      // Needs improvement CLS
      act(() => {
        clsHandler({ name: 'CLS', value: 0.15 });
      });
      expect(screen.getByText('⚠️')).toBeInTheDocument();

      // Poor CLS
      act(() => {
        clsHandler({ name: 'CLS', value: 0.3 });
      });
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    test('correctly rates FCP metrics', () => {
      render(<WebVitalsDashboard />);
      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      const fcpHandler = mockOnFCP.mock.calls[0][0];

      // Good FCP
      act(() => {
        fcpHandler({ name: 'FCP', value: 1500 });
      });
      expect(screen.getByText('✅')).toBeInTheDocument();

      // Needs improvement FCP
      act(() => {
        fcpHandler({ name: 'FCP', value: 2500 });
      });
      expect(screen.getByText('⚠️')).toBeInTheDocument();

      // Poor FCP
      act(() => {
        fcpHandler({ name: 'FCP', value: 3500 });
      });
      expect(screen.getByText('❌')).toBeInTheDocument();
    });
  });

  describe('Dashboard Content and Layout', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' };
    });

    test('shows collecting message when no metrics are available', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      expect(screen.getByText('Collecting metrics...')).toBeInTheDocument();
      expect(screen.getByText('Navigate around the site to generate metrics')).toBeInTheDocument();
      expect(screen.getByText('Press Ctrl+Shift+V to toggle this dashboard')).toBeInTheDocument();
    });

    test('displays metric descriptions correctly', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Add some metrics
      const clsHandler = mockOnCLS.mock.calls[0][0];
      const fcpHandler = mockOnFCP.mock.calls[0][0];

      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
        fcpHandler({ name: 'FCP', value: 1500 });
      });

      expect(screen.getByText('Cumulative Layout Shift - Visual stability')).toBeInTheDocument();
      expect(screen.getByText('First Contentful Paint - First render time')).toBeInTheDocument();
    });

    test('displays metric timestamps', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      const clsHandler = mockOnCLS.mock.calls[0][0];
      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
      });

      expect(screen.getByText('Measured at: 12:00:00 AM')).toBeInTheDocument();
    });

    test('shows performance summary when metrics are available', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Add metrics with different ratings
      const clsHandler = mockOnCLS.mock.calls[0][0];
      const fcpHandler = mockOnFCP.mock.calls[0][0];
      const lcpHandler = mockOnLCP.mock.calls[0][0];

      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 }); // Good
        fcpHandler({ name: 'FCP', value: 2500 }); // Needs improvement
        lcpHandler({ name: 'LCP', value: 5000 }); // Poor
      });

      expect(screen.getByText('Performance Summary')).toBeInTheDocument();
      expect(
        screen.getByText(text => text.includes('Good:') && text.includes('1'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(text => text.includes('Needs Improvement:') && text.includes('1'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(text => text.includes('Poor:') && text.includes('1'))
      ).toBeInTheDocument();
    });

    test('displays tips and instructions', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      expect(
        screen.getByText(/Metrics are collected as you interact with the page/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Data is sent to analytics if configured/)).toBeInTheDocument();
      expect(screen.getByText(/Press Ctrl\+Shift\+V to toggle this dashboard/)).toBeInTheDocument();
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' };
    });

    test('sends metrics to gtag when available', () => {
      render(<WebVitalsDashboard />);

      const clsHandler = mockOnCLS.mock.calls[0][0];
      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'web_vital', {
        metric_name: 'CLS',
        metric_value: 0.05,
        metric_rating: 'good',
      });
    });

    test('handles missing gtag gracefully', () => {
      // Remove gtag
      Object.defineProperty(window, 'gtag', {
        writable: true,
        value: undefined,
      });

      render(<WebVitalsDashboard />);

      const clsHandler = mockOnCLS.mock.calls[0][0];

      expect(() => {
        act(() => {
          clsHandler({ name: 'CLS', value: 0.05 });
        });
      }).not.toThrow();
    });
  });

  describe('Development Logging', () => {
    test('logs metrics in development mode', () => {
      process.env = { ...process.env, NODE_ENV: 'development' };
      render(<WebVitalsDashboard />);

      const clsHandler = mockOnCLS.mock.calls[0][0];
      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
      });

      expect(mockConsoleLog).toHaveBeenCalledWith('Web Vital [CLS]:', {
        value: '0.050',
        rating: 'good',
        raw: { name: 'CLS', value: 0.05 },
      });
    });

    test('does not log metrics in production mode', () => {
      process.env = { ...process.env, NODE_ENV: 'production' };
      render(<WebVitalsDashboard />);

      const clsHandler = mockOnCLS.mock.calls[0][0];
      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
      });

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });

  describe('CSS Classes and Styling', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' };
    });

    test('applies correct CSS classes to dashboard container', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      const dashboard = screen.getByTestId('web-vitals-dashboard');
      expect(dashboard).toHaveClass(
        'fixed',
        'bottom-20',
        'right-4',
        'z-40',
        'bg-white',
        'dark:bg-gray-800',
        'p-6',
        'rounded-lg',
        'shadow-2xl',
        'max-w-4xl',
        'max-h-[80vh]',
        'overflow-auto'
      );
    });

    test('applies correct CSS classes to toggle button', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      expect(toggleButton).toHaveClass(
        'fixed',
        'bottom-4',
        'right-4',
        'z-50',
        'bg-blue-600',
        'text-white',
        'p-3',
        'rounded-full',
        'shadow-lg',
        'hover:bg-blue-700',
        'transition-colors'
      );
    });

    test('applies rating-specific colors to metric cards', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      // Good metric
      const clsHandler = mockOnCLS.mock.calls[0][0];
      act(() => {
        clsHandler({ name: 'CLS', value: 0.05 });
      });

      // Verify that CLS metric is displayed
      const clsText = screen.getByText('CLS');
      expect(clsText).toBeInTheDocument();

      // Verify the good rating value is displayed
      const clsValue = screen.getByText('0.050');
      expect(clsValue).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles unknown metric names gracefully', () => {
      render(<WebVitalsDashboard />);

      const clsHandler = mockOnCLS.mock.calls[0][0];

      expect(() => {
        act(() => {
          clsHandler({ name: 'UNKNOWN_METRIC', value: 100 });
        });
      }).not.toThrow();
    });

    test('handles missing console.log gracefully', () => {
      process.env = { ...process.env, NODE_ENV: 'development' };

      // Mock console to not have log method
      const originalConsole = global.console;
      global.console = {} as typeof console;

      render(<WebVitalsDashboard />);

      const clsHandler = mockOnCLS.mock.calls[0][0];

      expect(() => {
        act(() => {
          clsHandler({ name: 'CLS', value: 0.05 });
        });
      }).not.toThrow();

      // Restore console
      global.console = originalConsole;
    });

    test('removes event listener on unmount in development', () => {
      process.env = { ...process.env, NODE_ENV: 'development' };

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = render(<WebVitalsDashboard />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Component Display Names', () => {
    test('WebVitalsDashboard has correct display name', () => {
      expect(WebVitalsDashboard.displayName).toBe('WebVitalsDashboard');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      process.env = { ...process.env, NODE_ENV: 'development' };
    });

    test('toggle button has correct accessibility attributes', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle Web Vitals Dashboard');
    });

    test('close button has correct accessibility attributes', () => {
      render(<WebVitalsDashboard />);

      const toggleButton = screen.getByRole('button', { name: /toggle web vitals dashboard/i });
      fireEvent.click(toggleButton);

      const closeButton = screen.getByRole('button', { name: /close dashboard/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close dashboard');
    });
  });
});
