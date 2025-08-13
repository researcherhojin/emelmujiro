import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { BlogPost } from '../../types';
import { useBlog } from '../../contexts/BlogContext';
import { api } from '../../services/api';
import logger from '../../utils/logger';

interface BlogSearchProps {
  onSearch?: (results: BlogPost[]) => void;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ onSearch }) => {
  const { posts } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        const searches = JSON.parse(saved);
        if (Array.isArray(searches)) {
          setRecentSearches(searches);
        }
      }
    } catch (error) {
      logger.error('Failed to load recent searches:', error);
      setRecentSearches([]);
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = (term: string) => {
    if (!term.trim()) return;

    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Search function - try API first, fallback to local search
  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        if (onSearch) onSearch(posts);
        return;
      }

      try {
        // Try API search first
        const response = await api.searchBlogPosts(term);
        if (response.data && response.data.results) {
          const results = response.data.results;
          setSearchResults(results);
          if (onSearch) onSearch(results);
          return;
        }
      } catch (error) {
        logger.warn('API search failed, using local search:', error);
      }

      // Fallback to local search
      const lowerTerm = term.toLowerCase();
      const results = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerTerm) ||
          post.content.toLowerCase().includes(lowerTerm) ||
          (post.excerpt && post.excerpt.toLowerCase().includes(lowerTerm)) ||
          (post.category && post.category.toLowerCase().includes(lowerTerm)) ||
          (post.tags &&
            post.tags.some((tag) => tag.toLowerCase().includes(lowerTerm)))
      );

      setSearchResults(results);
      if (onSearch) onSearch(results);
    },
    [posts, onSearch]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    performSearch(term);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      saveToRecentSearches(searchTerm);
      setShowSuggestions(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    if (onSearch) onSearch(posts);
  };

  // Apply recent search
  const applyRecentSearch = (term: string) => {
    setSearchTerm(term);
    performSearch(term);
    setShowSuggestions(false);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="블로그 검색..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </form>

      {/* Search suggestions */}
      {showSuggestions && recentSearches.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">최근 검색</span>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                모두 지우기
              </button>
            </div>
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => applyRecentSearch(term)}
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search results info */}
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          {searchResults.length > 0 ? (
            <span>{searchResults.length}개의 검색 결과</span>
          ) : (
            <span>검색 결과가 없습니다</span>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogSearch;
