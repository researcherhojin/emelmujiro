import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { api } from '../services/api';
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
      // 먼저 API 호출 시도
      const response = await api.getBlogPosts(page);
      const postsPerPage = Number(process.env.REACT_APP_POSTS_PER_PAGE) || 6;

      if (response.data && response.data.results) {
        setPosts(response.data.results);
        setTotalPages(Math.ceil(response.data.count / postsPerPage));
        setCurrentPage(page);
      } else {
        // API 응답이 비어있으면 로컬 데이터 사용
        const localPosts = await getLocalBlogPosts();
        setPosts(localPosts as BlogPost[]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err) {
      logger.warn(
        'API 호출 실패, 로컬 데이터 사용:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      // API 실패 시 로컬 데이터로 폴백
      try {
        const localPosts = await getLocalBlogPosts();
        setPosts(localPosts as BlogPost[]);
        setTotalPages(1);
        setCurrentPage(1);
      } catch (localErr) {
        setError('블로그 포스트를 불러오는데 실패했습니다.');
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
      // 먼저 API 호출 시도
      const response = await api.getBlogPost(id);
      if (response.data) {
        setCurrentPost(response.data);
      } else {
        // API 응답이 비어있으면 로컬 데이터 사용
        const localPost = await getLocalBlogPost(id);
        setCurrentPost(localPost as BlogPost);
      }
    } catch (err) {
      logger.warn(
        'API 호출 실패, 로컬 데이터 사용:',
        err instanceof Error ? err.message : 'Unknown error'
      );
      // API 실패 시 로컬 데이터로 폴백
      try {
        const localPost = await getLocalBlogPost(id);
        setCurrentPost(localPost as BlogPost);
      } catch (localErr) {
        setError('포스트를 불러오는데 실패했습니다.');
        setCurrentPost(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentPost = () => {
    setCurrentPost(null);
  };

  const value: BlogContextType = {
    posts,
    currentPost,
    loading,
    error,
    totalPages,
    currentPage,
    fetchPosts,
    fetchPostById,
    clearCurrentPost,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};
