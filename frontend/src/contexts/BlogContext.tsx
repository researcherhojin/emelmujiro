import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { api } from '../services/api';
import { getBlogPosts, getBlogPost } from '../data/blogPosts';
import { BlogPost } from '../types';

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

    const fetchPosts = async (page: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            // 임시로 로컬 데이터 사용
            const posts = await getBlogPosts();
            setPosts(posts as BlogPost[]);
            setTotalPages(1);
            setCurrentPage(page);
        } catch (err: any) {
            setError('블로그 포스트를 불러오는데 실패했습니다.');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPostById = async (id: string | number) => {
        setLoading(true);
        setError(null);
        try {
            // 임시로 로컬 데이터 사용
            const post = await getBlogPost(id);
            setCurrentPost(post as BlogPost);
        } catch (err: any) {
            setError('포스트를 불러오는데 실패했습니다.');
            setCurrentPost(null);
        } finally {
            setLoading(false);
        }
    };

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