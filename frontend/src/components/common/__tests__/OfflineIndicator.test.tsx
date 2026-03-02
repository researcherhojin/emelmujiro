import { vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import OfflineIndicator from '../OfflineIndicator';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('OfflineIndicator', () => {
  beforeEach(() => {
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('does not show indicator when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    render(<OfflineIndicator />);

    // Should not render anything when online
    const offlineMessage = screen.queryByText('offline.status');
    expect(offlineMessage).not.toBeInTheDocument();
  });

  it('shows indicator when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<OfflineIndicator />);

    expect(screen.getByText('offline.status')).toBeInTheDocument();
  });

  it('responds to online event', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    render(<OfflineIndicator />);

    // Initially offline
    expect(screen.getByText('offline.status')).toBeInTheDocument();

    // Simulate going online
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Dispatch online event
      window.dispatchEvent(new Event('online'));
    });

    // Should hide indicator
    const offlineMessage = screen.queryByText('offline.status');
    expect(offlineMessage).not.toBeInTheDocument();
  });

  it('responds to offline event', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    render(<OfflineIndicator />);

    // Initially online (no indicator)
    expect(screen.queryByText('offline.status')).not.toBeInTheDocument();

    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Dispatch offline event
      window.dispatchEvent(new Event('offline'));
    });

    // Should show indicator
    expect(screen.getByText('offline.status')).toBeInTheDocument();
  });
});
