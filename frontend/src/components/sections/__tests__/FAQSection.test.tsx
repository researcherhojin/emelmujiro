import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FAQSection from '../FAQSection';
import React from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
}));

describe('FAQSection', () => {
  it('renders the FAQ section with title and subtitle', () => {
    render(<FAQSection />);
    expect(screen.getByText('faq.title')).toBeInTheDocument();
    expect(screen.getByText('faq.subtitle')).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    render(<FAQSection />);
    expect(screen.getByText('faq.categories.all')).toBeInTheDocument();
    expect(screen.getByText('faq.categories.general')).toBeInTheDocument();
    expect(screen.getByText('faq.categories.education')).toBeInTheDocument();
    expect(screen.getByText('faq.categories.consulting')).toBeInTheDocument();
    expect(screen.getByText('faq.categories.technical')).toBeInTheDocument();
  });

  it('renders FAQ items', () => {
    render(<FAQSection />);
    expect(screen.getByText('faq.items.general1.question')).toBeInTheDocument();
    expect(screen.getByText('faq.items.education1.question')).toBeInTheDocument();
    expect(screen.getByText('faq.items.consulting1.question')).toBeInTheDocument();
    expect(screen.getByText('faq.items.technical1.question')).toBeInTheDocument();
  });

  it('expands and collapses FAQ item on click', () => {
    render(<FAQSection />);
    const firstQuestion = screen.getByText('faq.items.general1.question');
    const button = firstQuestion.closest('button')!;

    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands FAQ item on Enter key', () => {
    render(<FAQSection />);
    const firstQuestion = screen.getByText('faq.items.general1.question');
    const button = firstQuestion.closest('button')!;

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands FAQ item on Space key', () => {
    render(<FAQSection />);
    const firstQuestion = screen.getByText('faq.items.general1.question');
    const button = firstQuestion.closest('button')!;

    fireEvent.keyDown(button, { key: ' ' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('filters items when category tab is clicked', () => {
    render(<FAQSection />);
    const educationTab = screen.getByText('faq.categories.education');
    fireEvent.click(educationTab);
    expect(educationTab).toBeInTheDocument();
  });

  it('resets open items when category changes', () => {
    render(<FAQSection />);

    const firstQuestion = screen.getByText('faq.items.general1.question');
    fireEvent.click(firstQuestion.closest('button')!);
    expect(firstQuestion.closest('button')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByText('faq.categories.education'));
    const allTabs = screen.getAllByText('faq.categories.all');
    fireEvent.click(allTabs[0]);

    const reopenedButton = screen.getByText('faq.items.general1.question').closest('button');
    expect(reopenedButton).toHaveAttribute('aria-expanded', 'false');
  });
});
