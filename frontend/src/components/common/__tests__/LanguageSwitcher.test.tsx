import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test-utils/renderWithProviders';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('LanguageSwitcher', () => {
  const mockChangeLanguage = jest.fn();
  const mockI18n = {
    language: 'ko',
    changeLanguage: mockChangeLanguage,
  };
  const mockT = (key: string) => {
    const translations: { [key: string]: string } = {
      'accessibility.languageSelector': 'Language selector',
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: mockI18n,
      ready: true,
    } as ReturnType<typeof useTranslation>);

    // Clear localStorage before each test
    localStorage.clear();

    // Clear all mocks
    mockChangeLanguage.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders language switcher button', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays current language flag and name', () => {
    render(<LanguageSwitcher />);

    // Korean flag should be visible
    expect(screen.getByText('🇰🇷')).toBeInTheDocument();
    // Korean name should be visible on larger screens
    expect(screen.getByText('한국어')).toBeInTheDocument();
  });

  it('opens dropdown when button is clicked', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Dropdown should be open
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Both language options should be visible in dropdown
    expect(screen.getByRole('option', { name: /한국어/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /English/ })).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Dropdown should be open
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Click outside
    fireEvent.mouseDown(document.body);

    // Dropdown should be closed
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('changes language when option is selected', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    // Should call changeLanguage with 'en'
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  it('stores language preference in localStorage', async () => {
    // Mock successful language change
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    });
  });

  it('updates document language attribute', async () => {
    // Mock successful language change
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(document.documentElement.lang).toBe('en');
    });
  });

  it('handles keyboard navigation', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');

    // Test Enter key to open dropdown
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Test Escape key to close dropdown
    fireEvent.keyDown(button, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows current language as selected', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Korean should be marked as selected
    const koreanOption = screen.getByRole('option', { name: /한국어/ });
    expect(koreanOption).toHaveAttribute('aria-selected', 'true');

    // English should not be selected
    const englishOption = screen.getByRole('option', { name: /English/ });
    expect(englishOption).toHaveAttribute('aria-selected', 'false');
  });

  it('dispatches custom language change event', async () => {
    mockChangeLanguage.mockResolvedValue(undefined);

    const eventListener = jest.fn();
    window.addEventListener('languageChanged', eventListener);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { language: 'en' },
        })
      );
    });

    window.removeEventListener('languageChanged', eventListener);
  });

  it('displays English language when i18n language is en', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: { ...mockI18n, language: 'en' },
      ready: true,
    } as ReturnType<typeof useTranslation>);

    render(<LanguageSwitcher />);

    // US flag should be visible
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    // English name should be visible
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('handles language change errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockChangeLanguage.mockRejectedValue(new Error('Language change failed'));

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to change language:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
