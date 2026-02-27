import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServiceCards from '../ServiceCards';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('lucide-react', () => ({
  Code: (props: Record<string, unknown>) => (
    <div data-testid="code-icon" {...props} />
  ),
  GraduationCap: (props: Record<string, unknown>) => (
    <div data-testid="graduationcap-icon" {...props} />
  ),
  MessageSquare: (props: Record<string, unknown>) => (
    <div data-testid="messagesquare-icon" {...props} />
  ),
  Database: (props: Record<string, unknown>) => (
    <div data-testid="database-icon" {...props} />
  ),
}));

describe('ServiceCards', () => {
  it('renders without crashing', () => {
    render(<ServiceCards />);
    expect(document.body).toBeInTheDocument();
  });

  it('renders four service cards', () => {
    render(<ServiceCards />);

    expect(
      screen.getByText('contact.services.consulting.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('contact.services.education.title')
    ).toBeInTheDocument();
    expect(screen.getByText('contact.services.llm.title')).toBeInTheDocument();
    expect(screen.getByText('contact.services.data.title')).toBeInTheDocument();
  });

  it('renders descriptions for each service', () => {
    render(<ServiceCards />);

    expect(
      screen.getByText('contact.services.consulting.description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('contact.services.education.description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('contact.services.llm.description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('contact.services.data.description')
    ).toBeInTheDocument();
  });

  it('renders features for consulting service', () => {
    render(<ServiceCards />);

    expect(
      screen.getByText('contact.services.consulting.feature1')
    ).toBeInTheDocument();
    expect(
      screen.getByText('contact.services.consulting.feature2')
    ).toBeInTheDocument();
    expect(
      screen.getByText('contact.services.consulting.feature3')
    ).toBeInTheDocument();
  });

  it('renders features for all services (12 total features)', () => {
    render(<ServiceCards />);

    const services = ['consulting', 'education', 'llm', 'data'];
    services.forEach((service) => {
      for (let i = 1; i <= 3; i++) {
        expect(
          screen.getByText(`contact.services.${service}.feature${i}`)
        ).toBeInTheDocument();
      }
    });
  });

  it('renders all four icons', () => {
    render(<ServiceCards />);

    expect(screen.getByTestId('code-icon')).toBeInTheDocument();
    expect(screen.getByTestId('graduationcap-icon')).toBeInTheDocument();
    expect(screen.getByTestId('messagesquare-icon')).toBeInTheDocument();
    expect(screen.getByTestId('database-icon')).toBeInTheDocument();
  });

  it('renders in a grid layout', () => {
    const { container } = render(<ServiceCards />);

    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('md:grid-cols-2');
  });

  it('renders feature lists with bullet points', () => {
    const { container } = render(<ServiceCards />);

    const listItems = container.querySelectorAll('li');
    // 4 services * 3 features = 12 list items
    expect(listItems).toHaveLength(12);
  });
});
