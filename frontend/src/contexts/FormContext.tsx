import React, { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../services/api';
import i18n from '../i18n';

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: string;
  message: string;
}

interface FormContextType {
  // Contact Form State
  contactForm: ContactFormState;
  updateContactForm: (field: keyof ContactFormState, value: string) => void;
  resetContactForm: () => void;

  // Form Submission
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  submitContactForm: () => Promise<void>;
  clearSubmitState: () => void;

  // Validation
  formErrors: Partial<ContactFormState>;
  validateContactForm: () => boolean;
  clearFormErrors: () => void;
}

const initialContactForm: ContactFormState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  inquiryType: 'general',
  message: '',
};

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [contactForm, setContactForm] =
    useState<ContactFormState>(initialContactForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<ContactFormState>>({});

  const updateContactForm = (field: keyof ContactFormState, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const resetContactForm = () => {
    setContactForm(initialContactForm);
    clearFormErrors();
    clearSubmitState();
  };

  const validateContactForm = (): boolean => {
    const errors: Partial<ContactFormState> = {};

    // Name validation
    if (!contactForm.name.trim()) {
      errors.name = i18n.t('formValidation.nameRequired');
    } else if (contactForm.name.trim().length < 2) {
      errors.name = i18n.t('formValidation.nameMinLength');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactForm.email.trim()) {
      errors.email = i18n.t('formValidation.emailRequired');
    } else if (!emailRegex.test(contactForm.email)) {
      errors.email = i18n.t('formValidation.emailInvalid');
    }

    // Phone validation (optional but if provided, must be valid)
    if (contactForm.phone) {
      const phoneRegex = /^[0-9-+() ]+$/;
      if (!phoneRegex.test(contactForm.phone)) {
        errors.phone = i18n.t('formValidation.phoneInvalid');
      }
    }

    // Message validation
    if (!contactForm.message.trim()) {
      errors.message = i18n.t('formValidation.messageRequired');
    } else if (contactForm.message.trim().length < 10) {
      errors.message = i18n.t('formValidation.messageMinLength');
    } else if (contactForm.message.length > 1000) {
      errors.message = i18n.t('formValidation.messageMaxLength');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitContactForm = async () => {
    // Validate form first
    if (!validateContactForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await api.createContact({
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
      });

      setSubmitSuccess(true);

      // Store in localStorage for offline support
      const savedContacts = JSON.parse(
        localStorage.getItem('savedContacts') || '[]'
      );
      savedContacts.push({
        ...contactForm,
        timestamp: new Date().toISOString(),
        synced: true,
      });
      localStorage.setItem('savedContacts', JSON.stringify(savedContacts));

      // Reset form after successful submission
      setTimeout(() => {
        resetContactForm();
      }, 2000);
    } catch (error) {
      const err = error as Error & { userMessage?: string };
      setSubmitError(
        err.userMessage || err.message || i18n.t('formValidation.submitFailed')
      );

      // Save to localStorage for later sync if offline
      if (!navigator.onLine) {
        const pendingContacts = JSON.parse(
          localStorage.getItem('pendingContacts') || '[]'
        );
        pendingContacts.push({
          ...contactForm,
          timestamp: new Date().toISOString(),
          synced: false,
        });
        localStorage.setItem(
          'pendingContacts',
          JSON.stringify(pendingContacts)
        );
        setSubmitError(i18n.t('formValidation.offlineMessage'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSubmitState = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const clearFormErrors = () => {
    setFormErrors({});
  };

  const value: FormContextType = {
    contactForm,
    updateContactForm,
    resetContactForm,
    isSubmitting,
    submitError,
    submitSuccess,
    submitContactForm,
    clearSubmitState,
    formErrors,
    validateContactForm,
    clearFormErrors,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};
