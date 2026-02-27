import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import NotFound from '../NotFound';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
      const { initial: _i, animate: _a, transition: _t, ...safeProps } = rest;
      return (
        <div className={className} {...safeProps}>
          {children}
        </div>
      );
    },
  },
}));

vi.mock('lucide-react', () => ({
  Home: (props: Record<string, unknown>) => (
    <div data-testid="home-icon" {...props} />
  ),
  Search: (props: Record<string, unknown>) => (
    <div data-testid="search-icon" {...props} />
  ),
  ArrowLeft: (props: Record<string, unknown>) => (
    <div data-testid="arrowleft-icon" {...props} />
  ),
  HelpCircle: (props: Record<string, unknown>) => (
    <div data-testid="helpcircle-icon" {...props} />
  ),
}));

describe('NotFound', () => {
  it('renders the 404 heading', () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders the title and description', () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByText('notFound.title')).toBeInTheDocument();
    expect(screen.getByText('notFound.description')).toBeInTheDocument();
  });

  it('renders the go back button', () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByText('notFound.goBack')).toBeInTheDocument();
  });

  it('renders the go home link', () => {
    renderWithProviders(<NotFound />);

    const homeLink = screen.getByText('notFound.goHome');
    expect(homeLink).toBeInTheDocument();
  });

  it('renders the help/contact link', () => {
    renderWithProviders(<NotFound />);

    const helpLink = screen.getByText('notFound.help');
    expect(helpLink).toBeInTheDocument();
  });

  it('calls navigate(-1) when go back button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotFound />);

    await user.click(screen.getByText('notFound.goBack'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders popular pages section with all page links', () => {
    renderWithProviders(<NotFound />);

    expect(screen.getByText('notFound.popularPages')).toBeInTheDocument();
    expect(screen.getByText('common.home')).toBeInTheDocument();
    expect(screen.getByText('common.about')).toBeInTheDocument();
    expect(screen.getByText('common.services')).toBeInTheDocument();
    expect(screen.getByText('common.blog')).toBeInTheDocument();
    expect(screen.getByText('common.contact')).toBeInTheDocument();
  });

  it('renders the SVG illustration', () => {
    const { container } = renderWithProviders(<NotFound />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
