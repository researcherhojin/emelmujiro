import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import ContactPage from '../ContactPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

describe('ContactPage', () => {
  it('renders without crashing', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders the contact form with all fields', () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByLabelText('contact.form.name')).toBeInTheDocument();
    expect(screen.getByLabelText('contact.form.email')).toBeInTheDocument();
    expect(screen.getByLabelText('contact.form.company')).toBeInTheDocument();
    expect(screen.getByLabelText('contact.form.message')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderWithProviders(<ContactPage />);

    const submitButton = screen.getByRole('button', { name: 'common.contact' });
    expect(submitButton).toBeInTheDocument();
  });

  it('updates input values when user types', () => {
    renderWithProviders(<ContactPage />);

    const nameInput = screen.getByLabelText('contact.form.name');
    fireEvent.change(nameInput, {
      target: { name: 'name', value: 'Test User' },
    });
    expect(nameInput).toHaveValue('Test User');

    const emailInput = screen.getByLabelText('contact.form.email');
    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'test@example.com' },
    });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('shows success message after form submission', () => {
    renderWithProviders(<ContactPage />);

    const form = screen.getByText('common.contact').closest('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('contactPage.successMessage')).toBeInTheDocument();
    expect(screen.getByText('contactPage.successDetail')).toBeInTheDocument();
  });

  it('hides the form after successful submission', () => {
    renderWithProviders(<ContactPage />);

    // Submit the form
    const form = screen.getByText('common.contact').closest('form')!;
    fireEvent.submit(form);

    // Form fields should no longer be visible
    expect(
      screen.queryByLabelText('contact.form.name')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('contact.form.email')
    ).not.toBeInTheDocument();
  });

  it('renders correct input placeholders', () => {
    renderWithProviders(<ContactPage />);

    expect(
      screen.getByPlaceholderText('contactPage.placeholder.name')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('example@company.com')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('contactPage.placeholder.company')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('contactPage.placeholder.message')
    ).toBeInTheDocument();
  });

  it('has required attribute on name, email, and message fields', () => {
    renderWithProviders(<ContactPage />);

    expect(screen.getByLabelText('contact.form.name')).toBeRequired();
    expect(screen.getByLabelText('contact.form.email')).toBeRequired();
    expect(screen.getByLabelText('contact.form.message')).toBeRequired();
    // company is not required
    expect(screen.getByLabelText('contact.form.company')).not.toBeRequired();
  });
});
