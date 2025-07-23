import React from 'react';
import { render, screen } from '@testing-library/react';
import PWAInstallButton from '../PWAInstallButton';

describe('PWAInstallButton Component', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test('does not render initially before beforeinstallprompt event', () => {
    render(<PWAInstallButton />);
    expect(screen.queryByText('앱 설치하기')).not.toBeInTheDocument();
  });

  test('does not render when PWA is already installed', () => {
    // Mock as standalone (already installed)
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<PWAInstallButton />);
    expect(screen.queryByText('앱 설치하기')).not.toBeInTheDocument();
  });
});