import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { api } from '../services/api';
import i18n from '../i18n';
import { setUserContext, clearUserContext } from '../utils/sentry';

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

  // Auth check on mount — inlined into the effect (previously a separate
  // `checkAuthStatus` const defined after this hook). The separate-const
  // form worked because the effect callback runs after the component body,
  // but it made `exhaustive-deps` analysis fragile and invited stale-closure
  // bugs if the function ever grew external dependencies. Inlining removes
  // the question entirely.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Skip auth check if user has never logged in (no cookie hint).
      // httpOnly cookies aren't readable from JS, so we use a localStorage
      // flag that gets set on login and cleared on logout.
      if (!localStorage.getItem('auth_hint')) {
        // The cancelled guard here is dead in practice — run() is called
        // synchronously from the effect body, so line 57-59 execute before
        // React can run the cleanup. But leaving it unguarded means
        // setLoading would fire on an unmounted component in the rare
        // React 18 concurrent-render interrupt case. Defensive, unreachable
        // via current tests.
        /* v8 ignore next */
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const response = await api.getUser();
        // After-await cancelled checks ARE reachable: tests exercise both
        // the "unmount after resolve" and "unmount after reject" paths.
        if (cancelled) return;
        setUser(response.data);
        setUserContext({ id: response.data.id, email: response.data.email });
      } catch {
        if (cancelled) return;
        setUser(null);
        localStorage.removeItem('auth_hint');
      }
      // Same reasoning as line 58: if we got here, cancelled was false at
      // line 63/67 and there's no async barrier between there and here,
      // so this guard's false branch is unreachable. Kept for symmetry.
      /* v8 ignore next */
      if (!cancelled) setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.login(email, password);
      const { user: userData } = response.data;
      setUser(userData);
      setUserContext({ id: userData.id, email: userData.email });
      localStorage.setItem('auth_hint', '1');
    } catch (err) {
      const error = err as Error & { userMessage?: string };
      setError(error.userMessage || error.message || i18n.t('auth.loginFailed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Proceed with local logout even if server call fails
    }
    setUser(null);
    clearUserContext();
    localStorage.removeItem('auth_hint');
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.register(email, password, name);
      const { user: userData } = response.data;
      setUser(userData);
      setUserContext({ id: userData.id, email: userData.email });
      localStorage.setItem('auth_hint', '1');
    } catch (err) {
      const error = err as Error & { userMessage?: string };
      setError(error.userMessage || error.message || i18n.t('auth.registerFailed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
