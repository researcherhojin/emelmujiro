import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import axiosInstance from '../services/api';
import i18n from '../i18n';

interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await axiosInstance.get('/auth/user/');
        setUser(response.data);
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/login/', {
        username: email,
        password,
      });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('authToken', access);
      localStorage.setItem('refreshToken', refresh);
      setUser(userData);
    } catch (err) {
      const error = err as Error & { userMessage?: string };
      setError(
        error.userMessage || error.message || i18n.t('auth.loginFailed')
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axiosInstance.post('/auth/logout/', { refresh: refreshToken });
      } catch {
        // Proceed with local logout even if server call fails
      }
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post('/auth/register/', {
          username: email,
          email,
          password,
          password_confirm: password,
          first_name: name,
        });
        const { access, refresh, user: userData } = response.data;

        localStorage.setItem('authToken', access);
        localStorage.setItem('refreshToken', refresh);
        setUser(userData);
      } catch (err) {
        const error = err as Error & { userMessage?: string };
        setError(
          error.userMessage || error.message || i18n.t('auth.registerFailed')
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      error,
      login,
      logout,
      register,
      updateUser,
      clearError,
    }),
    [user, loading, error, login, logout, register, updateUser, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
