import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import PWAInstallButton from '../PWAInstallButton';

describe('PWAInstallButton Component', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  test('does not render initially before beforeinstallprompt event', () => {
    render(<PWAInstallButton />);
    expect(screen.queryByText('앱 설치하기')).not.toBeInTheDocument();
  });

  test('does not render when PWA is already installed', () => {
    // Mock as standalone (already installed)
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<PWAInstallButton />);
    expect(screen.queryByText('앱 설치하기')).not.toBeInTheDocument();
  });
});
