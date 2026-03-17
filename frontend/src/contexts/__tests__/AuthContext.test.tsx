import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

// Must use vi.hoisted so the mock object is available when vi.mock is hoisted
const mockApi = vi.hoisted(() => ({
  getUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  __esModule: true,
  api: mockApi,
  default: {},
}));

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password');
    } catch {
      // Silently catch errors for testing
    }
  };

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no authenticated user (getUser rejects)
    mockApi.getUser.mockRejectedValue(new Error('Not authenticated'));
  });

  test('provides initial state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test('handles successful login', async () => {
    mockApi.login.mockResolvedValueOnce({
      data: {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
        user: { email: 'test@example.com', id: 1, name: 'Test User' },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(mockApi.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  test('handles logout', async () => {
    mockApi.logout.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test('checks auth status on mount', async () => {
    mockApi.getUser.mockResolvedValueOnce({
      data: { email: 'existing@example.com', id: 1, name: 'Existing User' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('existing@example.com');
    expect(mockApi.getUser).toHaveBeenCalled();
  });

  test('sets loading state during auth operations', async () => {
    mockApi.login.mockResolvedValueOnce({
      data: {
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
        user: { email: 'test@example.com', id: 1, name: 'Test User' },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // After successful login, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  test('handles failed login attempts', async () => {
    const error = {
      response: {
        status: 401,
        data: { detail: 'Invalid credentials' },
      },
      message: 'Invalid credentials',
    };
    mockApi.login.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
