import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '../ContactForm';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('lucide-react', () => ({
  Send: (props: Record<string, unknown>) => (
    <div data-testid="send-icon" {...props} />
  ),
  WifiOff: (props: Record<string, unknown>) => (
    <div data-testid="wifioff-icon" {...props} />
  ),
}));

const defaultFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  inquiryType: 'consulting' as const,
  message: '',
};

describe('ContactForm', () => {
  const mockOnInputChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={false}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(
      screen.getByLabelText('contact.form.nameAriaLabel')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('contact.form.emailAriaLabel')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('contact.form.phoneAriaLabel')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('contact.form.companyAriaLabel')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('contact.form.inquiryTypeAriaLabel')
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('contact.form.messageAriaLabel')
    ).toBeInTheDocument();
  });

  it('renders the form with correct aria-label', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={false}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByRole('form')).toHaveAttribute(
      'aria-label',
      'contact.form.ariaLabel'
    );
  });

  it('displays formData values in the inputs', () => {
    const filledFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '010-1234-5678',
      company: 'Acme Corp',
      inquiryType: 'education' as const,
      message: 'Hello there',
    };

    render(
      <ContactForm
        formData={filledFormData}
        isSubmitting={false}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText('contact.form.nameAriaLabel')).toHaveValue(
      'John Doe'
    );
    expect(screen.getByLabelText('contact.form.emailAriaLabel')).toHaveValue(
      'john@example.com'
    );
    expect(screen.getByLabelText('contact.form.phoneAriaLabel')).toHaveValue(
      '010-1234-5678'
    );
    expect(screen.getByLabelText('contact.form.companyAriaLabel')).toHaveValue(
      'Acme Corp'
    );
    expect(
      screen.getByLabelText('contact.form.inquiryTypeAriaLabel')
    ).toHaveValue('education');
    expect(screen.getByLabelText('contact.form.messageAriaLabel')).toHaveValue(
      'Hello there'
    );
  });

  it('calls onInputChange when typing in inputs', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={false}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText('contact.form.nameAriaLabel'), {
      target: { value: 'Test' },
    });
    expect(mockOnInputChange).toHaveBeenCalled();
  });

  it('calls onSubmit when the form is submitted', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={false}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.submit(screen.getByRole('form'));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables the submit button when isSubmitting is true', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={true}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', {
      name: 'contact.form.submitAriaLabel',
    });
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('contact.form.submitting')).toBeInTheDocument();
  });

  it('shows submit text and Send icon when not submitting', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={false}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('contact.form.submit')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
  });

  it('shows offline warning when isOnline is false', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={false}
        isOnline={false}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('contact.form.offlineMode')).toBeInTheDocument();
    expect(screen.getByText('contact.form.offlineMessage')).toBeInTheDocument();
    expect(screen.getByTestId('wifioff-icon')).toBeInTheDocument();
  });

  it('does not show offline warning when isOnline is true', () => {
    render(
      <ContactForm
        formData={defaultFormData}
        isSubmitting={false}
        isOnline={true}
        onInputChange={mockOnInputChange}
        onSubmit={mockOnSubmit}
      />
    );

    expect(
      screen.queryByText('contact.form.offlineMode')
    ).not.toBeInTheDocument();
  });
});
