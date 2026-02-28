import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ContactPage from '../ContactPage';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const mockFormContext = {
  contactForm: {
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'consulting',
    message: '',
  },
  updateContactForm: vi.fn(),
  resetContactForm: vi.fn(),
  isSubmitting: false,
  submitError: null as string | null,
  submitSuccess: false,
  submitContactForm: vi.fn(),
  clearSubmitState: vi.fn(),
  formErrors: {},
  validateContactForm: vi.fn(() => true),
  clearFormErrors: vi.fn(),
};

vi.mock('../../../contexts/FormContext', () => ({
  useForm: () => mockFormContext,
}));

vi.mock('../../contact/ContactForm', () => ({
  default: () => <div data-testid="contact-form">ContactForm</div>,
}));

vi.mock('../../contact/ContactInfo', () => ({
  default: () => <div data-testid="contact-info">ContactInfo</div>,
}));

describe('ContactPage', () => {
  const renderPage = () =>
    render(
      <HelmetProvider>
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      </HelmetProvider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormContext.submitSuccess = false;
    mockFormContext.submitError = null;
  });

  it('renders page title and subtitle', () => {
    renderPage();
    expect(screen.getByText('contact.title')).toBeInTheDocument();
    expect(screen.getByText('contact.subtitle')).toBeInTheDocument();
  });

  it('renders ContactForm component', () => {
    renderPage();
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('renders ContactInfo component', () => {
    renderPage();
    expect(screen.getByTestId('contact-info')).toBeInTheDocument();
  });

  it('shows success message when form is submitted', () => {
    mockFormContext.submitSuccess = true;
    renderPage();
    expect(screen.getByText('contactPage.successMessage')).toBeInTheDocument();
    expect(screen.getByText('contactPage.successDetail')).toBeInTheDocument();
  });

  it('shows error message when submission fails', () => {
    mockFormContext.submitError = 'Network error';
    renderPage();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('does not show success/error by default', () => {
    renderPage();
    expect(
      screen.queryByText('contactPage.successMessage')
    ).not.toBeInTheDocument();
  });
});
