import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import axiosInstance from '../../services/api';

// Mock axios
vi.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockedAxios = axiosInstance as any;

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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test.skip('provides initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test.skip('handles successful login', async () => {
    // Mock successful login response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: { email: 'test@example.com', id: 1, name: 'Test User' },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');

    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login/', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'authToken',
      'fake-token'
    );
  });

  test.skip('handles logout', async () => {
    // Start with authenticated user
    mockLocalStorage.getItem.mockReturnValue('fake-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');

    fireEvent.click(logoutButton);

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
  });

  test.skip('checks auth status on mount', async () => {
    mockLocalStorage.getItem.mockReturnValue('existing-token');

    // Mock the checkAuth API call - returns user data directly
    mockedAxios.get.mockResolvedValueOnce({
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

    expect(screen.getByTestId('user')).toHaveTextContent(
      'existing@example.com'
    );

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
    expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me/');
  });

  test.skip('sets loading state during auth operations', async () => {
    // Mock successful login response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: { email: 'test@example.com', id: 1, name: 'Test User' },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');

    fireEvent.click(loginButton);

    // Loading state should have been true during operation
    // After successful login, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
  });

  test.skip('handles failed login attempts', async () => {
    // Mock failed login response
    const error = {
      response: {
        status: 401,
        data: { detail: 'Invalid credentials' },
      },
      message: 'Invalid credentials',
    };
    mockedAxios.post.mockRejectedValueOnce(error);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');

    // Attempt login which should fail
    fireEvent.click(loginButton);

    // Should remain unauthenticated after failed login
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('no-user');

    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
      'authToken',
      expect.any(String)
    );
  });

  test.skip('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
