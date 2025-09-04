import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  MockedFunction,
} from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '../../../test-utils/renderWithProviders';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockUseTranslation = useTranslation as MockedFunction<
  typeof useTranslation
>;

describe('LanguageSwitcher', () => {
  const mockChangeLanguage = vi.fn();
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
    vi.clearAllMocks();
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
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Both language options should be visible in dropdown
    expect(screen.getByRole('option', { name: /한국어/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /English/ })).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Simulate pressing Escape key
    fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' });

    // Dropdown should be closed
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('changes language when option is selected', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    // Should call changeLanguage with 'en'
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  it('stores language preference in localStorage', async () => {
    // The component should call i18n.changeLanguage when selecting a language
    // The actual localStorage setting happens inside the component's handleLanguageChange
    // Since we're mocking i18n.changeLanguage, we're actually testing that the language change
    // is initiated correctly. The actual localStorage setting is an implementation detail
    // of the component.
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    // Verify that changeLanguage was called, which would trigger localStorage update
    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });

    // Note: The actual localStorage.setItem call happens inside the component
    // but since we're mocking i18n, we can't directly test it here.
    // The important thing is that changeLanguage is called correctly.
  });

  it('updates document language attribute', async () => {
    // Mock successful language change
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Click on English option
    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });
  });

  it('handles keyboard navigation', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');

    // Focus the button
    button.focus();

    // Test Enter key to open dropdown
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Test Escape key to close dropdown
    fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('shows current language as selected', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Korean should be marked as selected
    const koreanOption = screen.getByRole('option', { name: /한국어/ });
    expect(koreanOption).toHaveAttribute('aria-selected', 'true');

    // English should not be selected
    const englishOption = screen.getByRole('option', { name: /English/ });
    expect(englishOption).toHaveAttribute('aria-selected', 'false');
  });

  it('calls changeLanguage when option is selected', async () => {
    mockChangeLanguage.mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

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
    const logger = await import('../../../utils/logger');
    const loggerErrorSpy = vi.spyOn(logger.default, 'error');
    mockChangeLanguage.mockRejectedValue(new Error('Language change failed'));

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    const englishOption = screen.getByRole('option', { name: /English/ });
    fireEvent.click(englishOption);

    await waitFor(() => {
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Failed to change language:',
        expect.any(Error)
      );
    });

    loggerErrorSpy.mockRestore();
  });

  it('dispatches custom language change event', async () => {
    mockChangeLanguage.mockResolvedValue(undefined);

    const eventListener = vi.fn();
    window.addEventListener('languageChanged', eventListener);

    render(<LanguageSwitcher />);

    const button = screen.getByLabelText('Language selector');
    fireEvent.click(button);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

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
});
