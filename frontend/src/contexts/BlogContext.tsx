import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { getEnvVar } from '../config/env';
import i18n from '../i18n';
import {
  getBlogPosts as getLocalBlogPosts,
  getBlogPost as getLocalBlogPost,
} from '../data/blogPosts';
import { BlogPost } from '../types';
import logger from '../utils/logger';

interface BlogContextType {
  posts: BlogPost[];
  currentPost: BlogPost | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchPosts: (page?: number) => Promise<void>;
  fetchPostById: (id: string | number) => Promise<void>;
  clearCurrentPost: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Try API call first
      const response = await api.getBlogPosts(page);
      const postsPerPage = Number(getEnvVar('POSTS_PER_PAGE')) || 10;

      if (response.data && response.data.results) {
        setPosts(response.data.results);
        setTotalPages(Math.ceil(response.data.count / postsPerPage));
        setCurrentPage(page);
      } else {
        // Use local data if API response is empty
        const localPosts = await getLocalBlogPosts();
        setPosts(localPosts as BlogPost[]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      logger.warn(
        'API call failed, falling back to local data:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      // Fallback to local data on API failure
      try {
        const localPosts = await getLocalBlogPosts();
        setPosts(localPosts as BlogPost[]);
        setTotalPages(1);
        setCurrentPage(1);
      } catch {
        setError(i18n.t('blogErrors.fetchPostsFailed'));
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPostById = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      // Try API call first
      const response = await api.getBlogPost(id);
      if (response.data) {
        setCurrentPost(response.data);
      } else {
        // Use local data if API response is empty
        const localPost = await getLocalBlogPost(id);
        setCurrentPost(localPost as BlogPost);
      }
    } catch (err) {
      logger.warn(
        'API call failed, falling back to local data:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      // Fallback to local data on API failure
      try {
        const localPost = await getLocalBlogPost(id);
        setCurrentPost(localPost as BlogPost);
      } catch {
        setError(i18n.t('blogErrors.fetchPostFailed'));
        setCurrentPost(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentPost = useCallback(() => {
    setCurrentPost(null);
  }, []);

  const value = useMemo<BlogContextType>(
    () => ({
      posts,
      currentPost,
      loading,
      error,
      totalPages,
      currentPage,
      fetchPosts,
      fetchPostById,
      clearCurrentPost,
    }),
    [
      posts,
      currentPost,
      loading,
      error,
      totalPages,
      currentPage,
      fetchPosts,
      fetchPostById,
      clearCurrentPost,
    ]
  );

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
