import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { returnObjects?: boolean }) => {
      if (options?.returnObjects) return ['Detail 1', 'Detail 2'];
      return key;
    },
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children?: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('../../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

vi.mock('../../common/ServiceModal', () => ({
  default: function MockServiceModal({
    isOpen,
    onClose,
    onContactClick,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onContactClick: () => void;
  }) {
    if (!isOpen) return null;
    return (
      <div data-testid="service-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onContactClick}>Contact</button>
      </div>
    );
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import ServicesSection from '../ServicesSection';

describe('ServicesSection Component', () => {
  const renderSection = () =>
    render(
      <BrowserRouter>
        <ServicesSection />
      </BrowserRouter>
    );

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders section title and subtitle', () => {
    renderSection();
    expect(screen.getByText('services.title')).toBeInTheDocument();
    expect(screen.getByText('services.subtitle')).toBeInTheDocument();
  });

  test('renders all 4 service cards', () => {
    renderSection();
    expect(screen.getByText('services.education.title')).toBeInTheDocument();
    expect(screen.getByText('services.consulting.title')).toBeInTheDocument();
    expect(screen.getByText('services.llmGenai.title')).toBeInTheDocument();
    expect(screen.getByText('services.computerVision.title')).toBeInTheDocument();
  });

  test('renders service descriptions', () => {
    renderSection();
    expect(screen.getByText('services.education.description')).toBeInTheDocument();
    expect(screen.getByText('services.consulting.description')).toBeInTheDocument();
  });

  test('renders detail list items', () => {
    renderSection();
    const details = screen.getAllByText('Detail 1');
    expect(details.length).toBe(4);
  });

  test('clicking a service card opens the modal', () => {
    renderSection();
    expect(screen.queryByTestId('service-modal')).not.toBeInTheDocument();

    const card = screen.getByText('services.education.title').closest('[role="button"]');
    fireEvent.click(card!);

    expect(screen.getByTestId('service-modal')).toBeInTheDocument();
  });

  test('pressing Enter on a service card opens the modal', () => {
    renderSection();
    const card = screen.getByText('services.consulting.title').closest('[role="button"]');
    fireEvent.keyDown(card!, { key: 'Enter' });

    expect(screen.getByTestId('service-modal')).toBeInTheDocument();
  });

  test('pressing Space on a service card opens the modal', () => {
    renderSection();
    const card = screen.getByText('services.llmGenai.title').closest('[role="button"]');
    fireEvent.keyDown(card!, { key: ' ' });

    expect(screen.getByTestId('service-modal')).toBeInTheDocument();
  });

  test('closing the modal hides it', () => {
    renderSection();
    const card = screen.getByText('services.education.title').closest('[role="button"]');
    fireEvent.click(card!);
    expect(screen.getByTestId('service-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('service-modal')).not.toBeInTheDocument();
  });

  test('contact click in modal navigates to contact page', () => {
    renderSection();
    const card = screen.getByText('services.education.title').closest('[role="button"]');
    fireEvent.click(card!);

    fireEvent.click(screen.getByText('Contact'));
    expect(mockNavigate).toHaveBeenCalledWith('/contact');
    expect(screen.queryByTestId('service-modal')).not.toBeInTheDocument();
  });

  test('service cards have role="button" and tabIndex', () => {
    renderSection();
    const cards = screen.getAllByRole('button', {
      name: /services\.(education|consulting|llmGenai|computerVision)\.title/,
    });
    expect(cards.length).toBe(4);
    cards.forEach((card) => {
      expect(card).toHaveAttribute('tabindex', '0');
    });
  });
});
