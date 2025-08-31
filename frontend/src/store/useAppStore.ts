import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// UI 상태 타입
interface UISlice {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  addNotification: (
    notification: Omit<UISlice['notifications'][0], 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// 인증 상태 타입
interface AuthSlice {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthSlice['user']) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

// 블로그 상태 타입
interface BlogSlice {
  posts: Array<{
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    tags: string[];
  }>;
  selectedPost: string | null;
  isLoadingPosts: boolean;
  setPosts: (posts: BlogSlice['posts']) => void;
  addPost: (post: BlogSlice['posts'][0]) => void;
  updatePost: (id: string, updates: Partial<BlogSlice['posts'][0]>) => void;
  deletePost: (id: string) => void;
  selectPost: (id: string | null) => void;
  setLoadingPosts: (loading: boolean) => void;
}

// 채팅 상태 타입
interface ChatSlice {
  messages: Array<{
    id: string;
    content: string;
    sender: 'user' | 'agent' | 'system';
    timestamp: number;
  }>;
  isTyping: boolean;
  isConnected: boolean;
  addMessage: (
    message: Omit<ChatSlice['messages'][0], 'id' | 'timestamp'>
  ) => void;
  clearMessages: () => void;
  setTyping: (typing: boolean) => void;
  setConnected: (connected: boolean) => void;
}

// 전체 스토어 타입
export interface AppStore extends UISlice, AuthSlice, BlogSlice, ChatSlice {}

// Zustand 스토어 생성
const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set) => ({
        // UI 상태
        theme: 'system',
        sidebarOpen: false,
        mobileMenuOpen: false,
        notifications: [],
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),
        toggleMobileMenu: () =>
          set((state) => {
            state.mobileMenuOpen = !state.mobileMenuOpen;
          }),
        addNotification: (notification) =>
          set((state) => {
            state.notifications.push({
              ...notification,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            });
          }),
        removeNotification: (id) =>
          set((state) => {
            state.notifications = state.notifications.filter(
              (n) => n.id !== id
            );
          }),
        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),

        // 인증 상태
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: (user) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
          }),
        logout: () =>
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
          }),
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),

        // 블로그 상태
        posts: [],
        selectedPost: null,
        isLoadingPosts: false,
        setPosts: (posts) =>
          set((state) => {
            state.posts = posts;
          }),
        addPost: (post) =>
          set((state) => {
            state.posts.push(post);
          }),
        updatePost: (id, updates) =>
          set((state) => {
            const index = state.posts.findIndex((p) => p.id === id);
            if (index !== -1) {
              state.posts[index] = { ...state.posts[index], ...updates };
            }
          }),
        deletePost: (id) =>
          set((state) => {
            state.posts = state.posts.filter((p) => p.id !== id);
          }),
        selectPost: (id) =>
          set((state) => {
            state.selectedPost = id;
          }),
        setLoadingPosts: (loading) =>
          set((state) => {
            state.isLoadingPosts = loading;
          }),

        // 채팅 상태
        messages: [],
        isTyping: false,
        isConnected: false,
        addMessage: (message) =>
          set((state) => {
            state.messages.push({
              ...message,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            });
          }),
        clearMessages: () =>
          set((state) => {
            state.messages = [];
          }),
        setTyping: (typing) =>
          set((state) => {
            state.isTyping = typing;
          }),
        setConnected: (connected) =>
          set((state) => {
            state.isConnected = connected;
          }),
      })),
      {
        name: 'app-store',
        partialize: (state) => ({
          theme: state.theme,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AppStore',
    }
  )
);

export default useAppStore;

// Selector hooks for better performance
export const useTheme = () => useAppStore((state) => state.theme);
export const useUser = () => useAppStore((state) => state.user);
export const useNotifications = () =>
  useAppStore((state) => state.notifications);
export const usePosts = () => useAppStore((state) => state.posts);
export const useMessages = () => useAppStore((state) => state.messages);
