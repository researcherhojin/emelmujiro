import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { trackDarkModeToggle } from '../utils/analytics';

type Theme = 'light' | 'dark';
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  props?: Record<string, unknown>;
}

interface UIContextType {
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;

  // Loading
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // Notifications
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;

  // Modals
  modals: Modal[];
  openModal: (
    component: React.ComponentType<Record<string, unknown>>,
    props?: Record<string, unknown>
  ) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Sidebar (for mobile)
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    // Validate the saved theme
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // If no saved preference, check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (prefersDark && prefersDark.matches) {
        return 'dark';
      }
    }
    return 'light';
  });
  const [isGlobalLoading, setGlobalLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modals, setModals] = useState<Modal[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const notificationTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;

    // Add transition class temporarily to prevent jarring transitions on initial load
    root.style.setProperty('--theme-transition', 'none');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }

    // Re-enable transitions after a brief moment
    const timerId = setTimeout(() => {
      root.style.removeProperty('--theme-transition');
    }, 100);

    return () => clearTimeout(timerId);
  }, [theme]);

  // Cleanup all notification timers on unmount
  useEffect(() => {
    const timers = notificationTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Ensure mediaQuery exists before accessing its properties
    if (!mediaQuery) {
      return;
    }

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Always follow system theme — user's manual toggle is temporary
      // until the next system theme change
      localStorage.removeItem('theme');
      setTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      // Save to localStorage only on manual toggle
      localStorage.setItem('theme', next);
      trackDarkModeToggle(next === 'dark');
      return next;
    });
  }, []);

  const removeNotification = useCallback((id: string) => {
    const timer = notificationTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      notificationTimers.current.delete(id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (type: NotificationType, message: string, duration: number = 5000) => {
      const id = crypto.randomUUID();
      const notification: Notification = { id, type, message, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        const timerId = setTimeout(() => {
          notificationTimers.current.delete(id);
          removeNotification(id);
        }, duration);
        notificationTimers.current.set(id, timerId);
      }
    },
    [removeNotification]
  );

  const openModal = useCallback(
    (
      component: React.ComponentType<Record<string, unknown>>,
      props?: Record<string, unknown>
    ): string => {
      const id = crypto.randomUUID();
      const modal: Modal = { id, component, props };
      setModals((prev) => [...prev, modal]);
      return id;
    },
    []
  );

  const closeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const value = useMemo<UIContextType>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
      isGlobalLoading,
      setGlobalLoading,
      notifications,
      showNotification,
      removeNotification,
      modals,
      openModal,
      closeModal,
      closeAllModals,
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen,
    }),
    [
      theme,
      toggleTheme,
      isGlobalLoading,
      notifications,
      showNotification,
      removeNotification,
      modals,
      openModal,
      closeModal,
      closeAllModals,
      isSidebarOpen,
      toggleSidebar,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
