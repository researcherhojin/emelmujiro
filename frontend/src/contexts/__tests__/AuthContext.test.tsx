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

vi.mock('../../i18n', () => ({
  default: { t: (key: string) => key, language: 'ko' },
}));

vi.mock('../../utils/sentry', () => ({
  setUserContext: vi.fn(),
  clearUserContext: vi.fn(),
}));

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, loading, error, login, logout, register, updateUser, clearError } =
    useAuth();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password');
    } catch {
      // Silently catch errors for testing
    }
  };

  const handleRegister = async () => {
    try {
      await register('new@example.com', 'password123', 'New User');
    } catch {
      // Silently catch errors for testing
    }
  };

  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="user-role">{user?.role || 'no-role'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => updateUser({ name: 'Updated Name' })}>Update</button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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
    localStorage.setItem('auth_hint', '1');
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

  test('sets auth_hint in localStorage on successful login', async () => {
    mockApi.login.mockResolvedValueOnce({
      data: {
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

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('auth_hint', '1');
  });

  test('removes auth_hint from localStorage on logout', async () => {
    // Start logged in
    localStorage.setItem('auth_hint', '1');
    mockApi.getUser.mockResolvedValueOnce({
      data: { email: 'test@example.com', id: 1, name: 'Test' },
    });
    mockApi.logout.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_hint');
  });

  test('skips getUser when auth_hint is not set', async () => {
    // No auth_hint set
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(mockApi.getUser).not.toHaveBeenCalled();
  });

  test('removes auth_hint when getUser fails on mount', async () => {
    localStorage.setItem('auth_hint', '1');
    mockApi.getUser.mockRejectedValueOnce(new Error('401 Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_hint');
  });

  test('sets error message on login failure', async () => {
    const error = { message: 'Network error' };
    mockApi.login.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
  });

  test('uses userMessage from error when available', async () => {
    const error = { message: 'Generic', userMessage: 'Custom user message' };
    mockApi.login.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Custom user message');
    });
  });

  test('clears error when clearError is called', async () => {
    const error = { message: 'Some error' };
    mockApi.login.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Some error');
    });

    fireEvent.click(screen.getByText('Clear Error'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  test('handles successful registration', async () => {
    mockApi.register.mockResolvedValueOnce({
      data: {
        user: { email: 'new@example.com', id: 2, name: 'New User' },
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

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('new@example.com');
    });

    expect(mockApi.register).toHaveBeenCalledWith('new@example.com', 'password123', 'New User');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_hint', '1');
  });

  test('handles failed registration', async () => {
    const error = { message: 'Email already exists' };
    mockApi.register.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Email already exists');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  test('updates user data with updateUser', async () => {
    // Start logged in
    localStorage.setItem('auth_hint', '1');
    mockApi.getUser.mockResolvedValueOnce({
      data: { email: 'test@example.com', id: 1, name: 'Test User' },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Update'));

    // User should still be authenticated, updateUser just merges partial data
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  test('updateUser does nothing when no user is logged in', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByText('Update'));

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test('handles logout even when server call fails', async () => {
    // Start logged in
    localStorage.setItem('auth_hint', '1');
    mockApi.getUser.mockResolvedValueOnce({
      data: { email: 'test@example.com', id: 1, name: 'Test' },
    });
    mockApi.logout.mockRejectedValueOnce(new Error('Server error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Logout'));

    // Should still log out locally even if server fails
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });
  });

  test('falls back to i18n translation for login error when no message', async () => {
    const error = {};
    mockApi.login.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      // Falls back to i18n.t('auth.loginFailed') which returns the key
      expect(screen.getByTestId('error')).toHaveTextContent('auth.loginFailed');
    });
  });

  test('falls back to i18n translation for register error when no message', async () => {
    // Reject with an error object that has neither userMessage nor message
    const error = { code: 500 };
    mockApi.register.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      // Falls back to i18n.t('auth.registerFailed') which returns the key
      expect(screen.getByTestId('error')).toHaveTextContent('auth.registerFailed');
    });
  });
});
