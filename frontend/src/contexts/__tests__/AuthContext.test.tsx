import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import axiosInstance from '../../services/api';

// Mock axios
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

// Test component to consume the context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, loading, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password');
    } catch (e) {
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
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  test('provides initial state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test('handles successful login', async () => {
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

    await act(async () => {
      fireEvent.click(loginButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login/', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'fake-token');
  });

  test('handles logout', async () => {
    // Start with authenticated user
    mockLocalStorage.getItem.mockReturnValue('fake-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
  });

  test('checks auth status on mount', async () => {
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
      expect(screen.getByTestId('user')).toHaveTextContent('existing@example.com');
    });

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
    expect(mockedAxios.get).toHaveBeenCalledWith('/auth/me/');
  });

  test('sets loading state during auth operations', async () => {
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

    await act(async () => {
      fireEvent.click(loginButton);
    });

    // Loading state should have been true during operation
    // After successful login, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  test('handles failed login attempts', async () => {
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
    await act(async () => {
      fireEvent.click(loginButton);
    });

    // Should remain unauthenticated after failed login
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('authToken', expect.any(String));
  });

  test('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});
