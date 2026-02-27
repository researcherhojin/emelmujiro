import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ServerError from '../ServerError';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      ...rest
    }: {
      children?: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => {
      const {
        initial: _i,
        animate: _a,
        transition: _t,
        key: _k,
        ...safeProps
      } = rest;
      return (
        <div className={className} {...safeProps}>
          {children}
        </div>
      );
    },
  },
}));

vi.mock('lucide-react', () => ({
  AlertTriangle: (props: Record<string, unknown>) => (
    <div data-testid="alert-triangle-icon" {...props} />
  ),
  RefreshCw: (props: Record<string, unknown>) => (
    <div data-testid="refresh-icon" {...props} />
  ),
  Home: (props: Record<string, unknown>) => (
    <div data-testid="home-icon" {...props} />
  ),
  Mail: (props: Record<string, unknown>) => (
    <div data-testid="mail-icon" {...props} />
  ),
  Wifi: (props: Record<string, unknown>) => (
    <div data-testid="wifi-icon" {...props} />
  ),
  WifiOff: (props: Record<string, unknown>) => (
    <div data-testid="wifioff-icon" {...props} />
  ),
}));

describe('ServerError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<ServerError />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays the initial 500 error code and message', () => {
    render(<ServerError />);

    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('serverError.status.500')).toBeInTheDocument();
  });

  it('displays the temporary issue message', () => {
    render(<ServerError />);

    expect(screen.getByText('serverError.temporaryIssue')).toBeInTheDocument();
  });

  it('renders the retry button', () => {
    render(<ServerError />);

    expect(screen.getByText('serverError.retry')).toBeInTheDocument();
  });

  it('renders the home button', () => {
    render(<ServerError />);

    expect(screen.getByText('common.home')).toBeInTheDocument();
  });

  it('renders the contact support link', () => {
    render(<ServerError />);

    expect(screen.getByText('serverError.contactSupport')).toBeInTheDocument();
  });

  it('displays help tips', () => {
    render(<ServerError />);

    expect(screen.getByText('serverError.helpText')).toBeInTheDocument();
    expect(screen.getByText(/serverError\.helpTip1/)).toBeInTheDocument();
    expect(screen.getByText(/serverError\.helpTip2/)).toBeInTheDocument();
    expect(screen.getByText(/serverError\.helpTip3/)).toBeInTheDocument();
  });

  it('shows retry count as 0/3 initially', () => {
    render(<ServerError />);

    expect(screen.getByText(/0\/3/)).toBeInTheDocument();
  });

  it('changes to retrying state when retry button is clicked', async () => {
    render(<ServerError />);

    await act(async () => {
      fireEvent.click(screen.getByText('serverError.retry'));
    });

    expect(screen.getByText('serverError.retryingButton')).toBeInTheDocument();
  });

  it('shows retry failed message after retry completes', async () => {
    render(<ServerError />);

    // Click retry
    await act(async () => {
      fireEvent.click(screen.getByText('serverError.retry'));
    });

    // Advance timer past the 2 second retry delay
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    // After retry fails, should show retry failed message
    expect(screen.getByText(/serverError\.retryFailed/)).toBeInTheDocument();
    expect(screen.getByText(/1\/3/)).toBeInTheDocument();
  });

  it('displays status info in footer', () => {
    render(<ServerError />);

    expect(screen.getByText(/serverError\.statusCode/)).toBeInTheDocument();
    expect(screen.getByText(/serverError\.time/)).toBeInTheDocument();
    expect(screen.getByText(/serverError\.network/)).toBeInTheDocument();
  });
});
