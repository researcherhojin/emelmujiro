import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const mockUseAuth = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const renderProtectedRoute = (props?: { requiredRole?: string }) => {
  return render(
    <MemoryRouter>
      <ProtectedRoute {...props}>
        <div>Protected Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('shows loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
    });

    renderProtectedRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to home when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    renderProtectedRoute();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated with no role requirement', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'test@example.com', name: 'Test' },
      isAuthenticated: true,
      loading: false,
    });

    renderProtectedRoute();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when authenticated with matching role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'admin@example.com', name: 'Admin', role: 'admin' },
      isAuthenticated: true,
      loading: false,
    });

    renderProtectedRoute({ requiredRole: 'admin' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects when authenticated but wrong role', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, email: 'user@example.com', name: 'User', role: 'user' },
      isAuthenticated: true,
      loading: false,
    });

    renderProtectedRoute({ requiredRole: 'admin' });
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
