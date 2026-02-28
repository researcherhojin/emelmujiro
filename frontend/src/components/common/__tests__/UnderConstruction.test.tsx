import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import UnderConstruction from '../UnderConstruction';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko', changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockBack = vi.fn();
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    ...window.history,
    back: mockBack,
  },
});

describe('UnderConstruction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBack.mockClear();
  });

  it('renders title', () => {
    render(
      <MemoryRouter>
        <UnderConstruction />
      </MemoryRouter>
    );

    expect(screen.getByText('underConstruction.title')).toBeInTheDocument();
  });

  it('renders default description when no featureKey', () => {
    render(
      <MemoryRouter>
        <UnderConstruction />
      </MemoryRouter>
    );

    expect(
      screen.getByText('underConstruction.description')
    ).toBeInTheDocument();
    expect(
      screen.getByText('underConstruction.comingSoon')
    ).toBeInTheDocument();
  });

  it('renders blog feature description', () => {
    render(
      <MemoryRouter>
        <UnderConstruction featureKey="blog" />
      </MemoryRouter>
    );

    expect(
      screen.getByText('underConstruction.features.blog')
    ).toBeInTheDocument();
  });

  it('renders contact feature description', () => {
    render(
      <MemoryRouter>
        <UnderConstruction featureKey="contact" />
      </MemoryRouter>
    );

    expect(
      screen.getByText('underConstruction.features.contact')
    ).toBeInTheDocument();
  });

  it('renders chat feature description', () => {
    render(
      <MemoryRouter>
        <UnderConstruction featureKey="chat" />
      </MemoryRouter>
    );

    expect(
      screen.getByText('underConstruction.features.chat')
    ).toBeInTheDocument();
  });

  it('navigates home on button click', () => {
    render(
      <MemoryRouter>
        <UnderConstruction />
      </MemoryRouter>
    );

    const homeButton = screen.getByRole('button', {
      name: 'underConstruction.goHome',
    });
    fireEvent.click(homeButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('goes back on button click', () => {
    render(
      <MemoryRouter>
        <UnderConstruction />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', {
      name: 'underConstruction.goBack',
    });
    fireEvent.click(backButton);
    expect(mockBack).toHaveBeenCalled();
  });
});
