import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { FormProvider, useForm } from '../FormContext';
import { api } from '../../services/api';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Mock i18n module (used directly via import in FormContext)
vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

// Mock api service
vi.mock('../../services/api', () => ({
  api: {
    createContact: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <FormProvider>{children}</FormProvider>
);

describe('FormContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // 1. useForm throws error outside provider
  it('throws error when useForm is used outside FormProvider', () => {
    // Suppress console.error for this test since React will log the error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useForm());
    }).toThrow('useForm must be used within a FormProvider');

    spy.mockRestore();
  });

  // 2. Initial state has empty form fields, isSubmitting false, submitSuccess false
  it('provides correct initial state', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    expect(result.current.contactForm).toEqual({
      name: '',
      email: '',
      phone: '',
      company: '',
      inquiryType: 'general',
      message: '',
    });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.submitSuccess).toBe(false);
    expect(result.current.submitError).toBeNull();
    expect(result.current.formErrors).toEqual({});
  });

  // 3. updateContactForm updates the field
  it('updates a form field via updateContactForm', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John Doe');
    });

    expect(result.current.contactForm.name).toBe('John Doe');
  });

  // 4. updateContactForm clears field error
  it('clears field error when updateContactForm is called for that field', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    // First trigger validation to create errors
    act(() => {
      result.current.validateContactForm();
    });

    // Name should have an error since it is empty
    expect(result.current.formErrors.name).toBeDefined();

    // Now update the name field — the error for name should be cleared
    act(() => {
      result.current.updateContactForm('name', 'A');
    });

    expect(result.current.formErrors.name).toBeUndefined();
  });

  // 5. resetContactForm resets all state
  it('resets all form state via resetContactForm', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    // Modify state
    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'Hello world, this is a long enough message.'
      );
    });

    // Validate to produce errors (or not) and then reset
    act(() => {
      result.current.resetContactForm();
    });

    expect(result.current.contactForm).toEqual({
      name: '',
      email: '',
      phone: '',
      company: '',
      inquiryType: 'general',
      message: '',
    });
    expect(result.current.formErrors).toEqual({});
    expect(result.current.submitError).toBeNull();
    expect(result.current.submitSuccess).toBe(false);
  });

  // 6. validateContactForm returns false with empty name
  it('returns false when name is empty', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('email', 'test@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.name).toBe('formValidation.nameRequired');
  });

  // 7. validateContactForm returns false with invalid email
  it('returns false with invalid email format', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'not-an-email');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.email).toBe('formValidation.emailInvalid');
  });

  // 8. validateContactForm returns false with short message (<10 chars)
  it('returns false when message is too short', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm('message', 'Short');
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.message).toBe(
      'formValidation.messageMinLength'
    );
  });

  // 9. validateContactForm returns false with long message (>1000 chars)
  it('returns false when message exceeds 1000 characters', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    const longMessage = 'a'.repeat(1001);

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm('message', longMessage);
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.message).toBe(
      'formValidation.messageMaxLength'
    );
  });

  // 10. validateContactForm passes with valid data
  it('returns true with all valid data', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John Doe');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a perfectly valid message for the contact form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.formErrors).toEqual({});
  });

  // 11. validateContactForm allows empty phone (optional)
  it('passes validation when phone is empty (optional field)', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John Doe');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm('phone', '');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.formErrors.phone).toBeUndefined();
  });

  // 12. validateContactForm rejects invalid phone characters
  it('returns false when phone contains invalid characters', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John Doe');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm('phone', 'abc-def');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.phone).toBe('formValidation.phoneInvalid');
  });

  // 13. submitContactForm calls api and sets success on resolve
  it('calls api.createContact and sets submitSuccess on successful submission', async () => {
    mockedApi.createContact.mockResolvedValueOnce({
      data: {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        message: 'Valid message',
      },
    });

    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    await act(async () => {
      await result.current.submitContactForm();
    });

    expect(mockedApi.createContact).toHaveBeenCalledWith({
      name: 'John',
      email: 'john@example.com',
      message: 'This is a valid message for the form.',
    });
    expect(result.current.submitSuccess).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });

  // 14. submitContactForm stores in localStorage on success
  it('stores contact in localStorage savedContacts on successful submission', async () => {
    mockedApi.createContact.mockResolvedValueOnce({
      data: {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        message: 'Valid message',
      },
    });

    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    await act(async () => {
      await result.current.submitContactForm();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'savedContacts',
      expect.stringContaining('"synced":true')
    );

    // Verify the stored data contains the form values
    const savedCall = (
      localStorage.setItem as ReturnType<typeof vi.fn>
    ).mock.calls.find((call: unknown[]) => call[0] === 'savedContacts');
    expect(savedCall).toBeDefined();
    const savedData = JSON.parse(savedCall![1] as string);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].name).toBe('John');
    expect(savedData[0].email).toBe('john@example.com');
    expect(savedData[0].synced).toBe(true);
    expect(savedData[0].timestamp).toBeDefined();
  });

  // 15. submitContactForm sets error on reject
  it('sets submitError when api.createContact rejects', async () => {
    const errorMessage = 'Network Error';
    mockedApi.createContact.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    await act(async () => {
      await result.current.submitContactForm();
    });

    expect(result.current.submitError).toBe(errorMessage);
    expect(result.current.submitSuccess).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
  });

  // 16. clearSubmitState clears error and success
  it('clears submitError and submitSuccess via clearSubmitState', async () => {
    mockedApi.createContact.mockResolvedValueOnce({
      data: {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        message: 'Valid message',
      },
    });

    const { result } = renderHook(() => useForm(), { wrapper });

    // Fill form and submit successfully
    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    await act(async () => {
      await result.current.submitContactForm();
    });

    expect(result.current.submitSuccess).toBe(true);

    // Clear submit state
    act(() => {
      result.current.clearSubmitState();
    });

    expect(result.current.submitSuccess).toBe(false);
    expect(result.current.submitError).toBeNull();
  });

  // Additional: submitContactForm does not call api if validation fails
  it('does not call api.createContact when validation fails', async () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    // Leave form empty - validation will fail
    await act(async () => {
      await result.current.submitContactForm();
    });

    expect(mockedApi.createContact).not.toHaveBeenCalled();
  });

  // Additional: submitContactForm stores in pendingContacts when offline
  it('stores contact in pendingContacts when offline and submission fails', async () => {
    mockedApi.createContact.mockRejectedValueOnce(new Error('Network Error'));

    // Set navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    await act(async () => {
      await result.current.submitContactForm();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pendingContacts',
      expect.stringContaining('"synced":false')
    );
    expect(result.current.submitError).toBe('formValidation.offlineMessage');

    // Restore navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  // Additional: clearFormErrors clears all validation errors
  it('clears all form errors via clearFormErrors', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    // Trigger validation to generate errors
    act(() => {
      result.current.validateContactForm();
    });

    expect(Object.keys(result.current.formErrors).length).toBeGreaterThan(0);

    act(() => {
      result.current.clearFormErrors();
    });

    expect(result.current.formErrors).toEqual({});
  });

  // Additional: validateContactForm returns false with empty email
  it('returns false when email is empty', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.email).toBe(
      'formValidation.emailRequired'
    );
  });

  // Additional: validateContactForm returns false when name is too short (1 char)
  it('returns false when name is only 1 character', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'J');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.name).toBe('formValidation.nameMinLength');
  });

  // Additional: validateContactForm accepts valid phone formats
  it('accepts valid phone number formats', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John Doe');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm('phone', '+82-10-1234-5678');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.formErrors.phone).toBeUndefined();
  });

  // Additional: submitContactForm uses userMessage from error if available
  it('uses userMessage from error object if available', async () => {
    const error = new Error('raw error') as Error & { userMessage?: string };
    error.userMessage = 'User-friendly error message';
    mockedApi.createContact.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
      result.current.updateContactForm(
        'message',
        'This is a valid message for the form.'
      );
    });

    await act(async () => {
      await result.current.submitContactForm();
    });

    expect(result.current.submitError).toBe('User-friendly error message');
  });

  // Additional: validateContactForm returns false with empty message
  it('returns false when message is empty', () => {
    const { result } = renderHook(() => useForm(), { wrapper });

    act(() => {
      result.current.updateContactForm('name', 'John');
      result.current.updateContactForm('email', 'john@example.com');
    });

    let isValid = false;
    act(() => {
      isValid = result.current.validateContactForm();
    });

    expect(isValid).toBe(false);
    expect(result.current.formErrors.message).toBe(
      'formValidation.messageRequired'
    );
  });
});
