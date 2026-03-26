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
  it('renders title and subtitle', () => {
    render(<FAQSection />);
    expect(screen.getByText('faq.title')).toBeInTheDocument();
    expect(screen.getByText('faq.subtitle')).toBeInTheDocument();
  });

  it('renders 5 FAQ items', () => {
    render(<FAQSection />);
    expect(screen.getByText('faq.items.general1.question')).toBeInTheDocument();
    expect(screen.getByText('faq.items.education1.question')).toBeInTheDocument();
    expect(screen.getByText('faq.items.education3.question')).toBeInTheDocument();
    expect(screen.getByText('faq.items.consulting2.question')).toBeInTheDocument();
    expect(screen.getByText('faq.items.technical2.question')).toBeInTheDocument();
  });

  it('expands and collapses on click', () => {
    render(<FAQSection />);
    const button = screen.getByText('faq.items.general1.question').closest('button')!;

    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands on Enter and Space keys', () => {
    render(<FAQSection />);
    const button = screen.getByText('faq.items.general1.question').closest('button')!;

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(button, { key: ' ' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands on Space key alone from closed state', () => {
    render(<FAQSection />);
    const button = screen.getByText('faq.items.education1.question').closest('button')!;

    // Start closed
    expect(button).toHaveAttribute('aria-expanded', 'false');

    // Press Space to open (covers the e.key === ' ' branch independently)
    fireEvent.keyDown(button, { key: ' ' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('ignores non-Enter/Space keyDown events', () => {
    render(<FAQSection />);
    const button = screen.getByText('faq.items.general1.question').closest('button')!;

    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(button, { key: 'Tab' });
    fireEvent.keyDown(button, { key: 'Escape' });
    fireEvent.keyDown(button, { key: 'ArrowDown' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('can have multiple items open simultaneously', () => {
    render(<FAQSection />);
    const btn1 = screen.getByText('faq.items.general1.question').closest('button')!;
    const btn2 = screen.getByText('faq.items.education1.question').closest('button')!;

    fireEvent.click(btn1);
    fireEvent.click(btn2);
    expect(btn1).toHaveAttribute('aria-expanded', 'true');
    expect(btn2).toHaveAttribute('aria-expanded', 'true');
  });
});
