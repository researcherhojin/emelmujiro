import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactInfo from '../ContactInfo';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('lucide-react', () => ({
  Mail: (props: Record<string, unknown>) => (
    <div data-testid="mail-icon" {...props} />
  ),
  Phone: (props: Record<string, unknown>) => (
    <div data-testid="phone-icon" {...props} />
  ),
}));

describe('ContactInfo', () => {
  it('renders without crashing', () => {
    render(<ContactInfo />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays the email address with a mailto link', () => {
    render(<ContactInfo />);

    const emailLink = screen.getByRole('link', {
      name: /researcherhojin@gmail\.com/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute(
      'href',
      'mailto:researcherhojin@gmail.com'
    );
  });

  it('displays the email icon', () => {
    render(<ContactInfo />);
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
  });

  it('displays the phone icon', () => {
    render(<ContactInfo />);
    expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
  });

  it('displays the phone section with translated title', () => {
    render(<ContactInfo />);

    expect(screen.getByText('contact.info.phone')).toBeInTheDocument();
    expect(screen.getByText('contact.info.phoneValue')).toBeInTheDocument();
  });

  it('displays business hours section', () => {
    render(<ContactInfo />);

    expect(screen.getByText('contact.info.businessHours')).toBeInTheDocument();
    expect(screen.getByText('contact.info.weekdays')).toBeInTheDocument();
    expect(screen.getByText('contact.info.weekends')).toBeInTheDocument();
  });

  it('displays quick response section', () => {
    render(<ContactInfo />);

    expect(screen.getByText('contact.info.quickResponse')).toBeInTheDocument();
    expect(
      screen.getByText('contact.info.responseMessage')
    ).toBeInTheDocument();
  });

  it('renders the email link with correct aria-label', () => {
    render(<ContactInfo />);

    const emailLink = screen.getByRole('link');
    expect(emailLink).toHaveAttribute(
      'aria-label',
      'contact.info.email: researcherhojin@gmail.com'
    );
  });
});
