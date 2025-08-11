import React from 'react';
import { render, screen, waitFor } from '../../../test-utils/renderWithProviders';
import userEvent from '@testing-library/user-event';
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
    } as unknown as ReturnType<typeof useTranslation>);

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

  it('opens dropdown when button is clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    // Dropdown should be open
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Both language options should be visible in dropdown
    expect(screen.getByRole('option', { name: /한국어/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /English/ })).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    // Dropdown should be open
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Simulate clicking outside by pressing Escape key instead
    await user.keyboard('{Escape}');

    // Dropdown should be closed
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('changes language when option is selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    await user.click(englishOption);

    // Should call changeLanguage with 'en'
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  it('stores language preference in localStorage', async () => {
    const user = userEvent.setup();
    // Mock successful language change
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    await user.click(englishOption);

    await waitFor(() => {
      expect(localStorage.getItem('i18nextLng')).toBe('en');
    });
  });

  it('updates document language attribute', async () => {
    const user = userEvent.setup();
    // Mock successful language change
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    await user.click(englishOption);

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');

    // Focus the button
    button.focus();

    // Test Enter key to open dropdown
    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Test Escape key to close dropdown
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows current language as selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    // Korean should be marked as selected
    const koreanOption = screen.getByRole('option', { name: /한국어/ });
    expect(koreanOption).toHaveAttribute('aria-selected', 'true');

    // English should not be selected
    const englishOption = screen.getByRole('option', { name: /English/ });
    expect(englishOption).toHaveAttribute('aria-selected', 'false');
  });

  it('calls changeLanguage when option is selected', async () => {
    const user = userEvent.setup();
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    const englishOption = screen.getByRole('option', { name: /English/ });
    await user.click(englishOption);

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  it('displays English language when i18n language is en', () => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: { ...mockI18n, language: 'en' },
      ready: true,
    } as unknown as ReturnType<typeof useTranslation>);

    render(<LanguageSwitcher />);

    // US flag should be visible
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    // English name should be visible
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('handles language change errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockChangeLanguage.mockRejectedValue(new Error('Language change failed'));

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    const englishOption = screen.getByRole('option', { name: /English/ });
    await user.click(englishOption);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to change language:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('dispatches custom language change event', async () => {
    const user = userEvent.setup();
    mockChangeLanguage.mockResolvedValue(undefined);

    const eventListener = jest.fn();
    window.addEventListener('languageChanged', eventListener);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    await user.click(button);

    const englishOption = screen.getByRole('option', { name: /English/ });
    await user.click(englishOption);

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { language: 'en' },
        })
      );
    });

    window.removeEventListener('languageChanged', eventListener);
  });
});
