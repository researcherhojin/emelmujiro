import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    return 'light';
  });
  const [isGlobalLoading, setGlobalLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [modals, setModals] = useState<Modal[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const showNotification = (type: NotificationType, message: string, duration: number = 5000) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message, duration };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const openModal = (
    component: React.ComponentType<Record<string, unknown>>,
    props?: Record<string, unknown>
  ): string => {
    const id = Date.now().toString();
    const modal: Modal = { id, component, props };
    setModals(prev => [...prev, modal]);
    return id;
  };

  const closeModal = (id: string) => {
    setModals(prev => prev.filter(m => m.id !== id));
  };

  const closeAllModals = () => {
    setModals([]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const value: UIContextType = {
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
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
