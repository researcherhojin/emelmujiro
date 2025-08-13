// Blog caching utilities for offline reading
import logger from './logger';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedDate?: string;
  tags?: string[];
  url?: string;
}

export interface CachedBlogPost extends BlogPost {
  cachedAt: number;
  lastAccessed: number;
}

const CACHE_KEY = 'emelmujiro-blog-cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHED_POSTS = 50;

// Check if blog caching is available
export function isBlogCacheAvailable(): boolean {
  return typeof Storage !== 'undefined' && 'serviceWorker' in navigator;
}

// Cache a blog post for offline reading
export async function cacheBlogPost(post: BlogPost): Promise<boolean> {
  if (!isBlogCacheAvailable()) {
    logger.warn('Blog cache not available');
    return false;
  }

  try {
    const cachedPost: CachedBlogPost = {
      ...post,
      cachedAt: Date.now(),
      lastAccessed: Date.now(),
    };

    // Store in localStorage
    const existingCache = getCachedPosts();
    const updatedCache = [cachedPost, ...existingCache.filter(p => p.id !== post.id)].slice(
      0,
      MAX_CACHED_POSTS
    );

    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));

    // Also cache via service worker if available
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: 'PRELOAD_BLOG_POSTS',
        data: { posts: [post] },
      });
    }

    logger.info(`Blog post cached: ${post.title}`);
    return true;
  } catch (error) {
    logger.error('Failed to cache blog post:', error);
    return false;
  }
}

// Get cached blog posts
export function getCachedPosts(): CachedBlogPost[] {
  if (!isBlogCacheAvailable()) {
    return [];
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return [];

    const posts: CachedBlogPost[] = JSON.parse(cached);
    const now = Date.now();

    // Filter out expired posts
    return posts.filter(post => {
      const isExpired = now - post.cachedAt > CACHE_EXPIRY;
      return !isExpired;
    });
  } catch (error) {
    logger.error('Failed to get cached posts:', error);
    return [];
  }
}

// Get a specific cached blog post
export function getCachedPost(postId: string): CachedBlogPost | null {
  const cachedPosts = getCachedPosts();
  const post = cachedPosts.find(p => p.id === postId);

  if (post) {
    // Update last accessed time
    updateLastAccessedTime(postId);
    return post;
  }

  return null;
}

// Update last accessed time for a cached post
export function updateLastAccessedTime(postId: string): void {
  try {
    const cachedPosts = getCachedPosts();
    const updatedPosts = cachedPosts.map(post =>
      post.id === postId ? { ...post, lastAccessed: Date.now() } : post
    );

    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedPosts));
  } catch (error) {
    logger.error('Failed to update last accessed time:', error);
  }
}

// Remove a cached blog post
export function removeCachedPost(postId: string): boolean {
  try {
    const cachedPosts = getCachedPosts();
    const updatedPosts = cachedPosts.filter(post => post.id !== postId);

    // Check if any post was actually removed
    if (cachedPosts.length === updatedPosts.length) {
      return false; // No post was removed
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedPosts));
    logger.info(`Removed cached post: ${postId}`);
    return true;
  } catch (error) {
    logger.error('Failed to remove cached post:', error);
    return false;
  }
}

// Clear all cached blog posts
export function clearBlogCache(): boolean {
  try {
    localStorage.removeItem(CACHE_KEY);
    logger.info('Blog cache cleared');
    return true;
  } catch (error) {
    logger.error('Failed to clear blog cache:', error);
    return false;
  }
}

// Get cache statistics
export function getBlogCacheStats() {
  const cachedPosts = getCachedPosts();
  const now = Date.now();

  return {
    totalPosts: cachedPosts.length,
    totalSize: JSON.stringify(cachedPosts).length,
    oldestPost: cachedPosts.reduce(
      (oldest, post) => (post.cachedAt < oldest ? post.cachedAt : oldest),
      now
    ),
    newestPost: cachedPosts.reduce(
      (newest, post) => (post.cachedAt > newest ? post.cachedAt : newest),
      0
    ),
    mostAccessed: cachedPosts.reduce(
      (most, post) => (post.lastAccessed > most.lastAccessed ? post : most),
      { lastAccessed: 0 } as CachedBlogPost
    ),
  };
}

// Preload popular or recent blog posts for offline reading
export async function preloadBlogPosts(posts: BlogPost[]): Promise<number> {
  let successCount = 0;

  for (const post of posts) {
    const success = await cacheBlogPost(post);
    if (success) successCount++;
  }

  logger.info(`Preloaded ${successCount}/${posts.length} blog posts`);
  return successCount;
}

// Check if a blog post is cached
export function isBlogPostCached(postId: string): boolean {
  return getCachedPost(postId) !== null;
}

// Get cached posts sorted by last accessed (most recent first)
export function getRecentlyAccessedPosts(limit: number = 10): CachedBlogPost[] {
  const cachedPosts = getCachedPosts();
  return cachedPosts.sort((a, b) => b.lastAccessed - a.lastAccessed).slice(0, limit);
}

// Clean up old cached posts based on usage
export function cleanupBlogCache(): void {
  const cachedPosts = getCachedPosts();
  const now = Date.now();

  // Remove posts older than cache expiry
  const validPosts = cachedPosts.filter(post => now - post.cachedAt <= CACHE_EXPIRY);

  // If still over limit, remove least recently accessed
  let finalPosts = validPosts;
  if (validPosts.length > MAX_CACHED_POSTS) {
    finalPosts = validPosts
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, MAX_CACHED_POSTS);
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(finalPosts));
    const removed = cachedPosts.length - finalPosts.length;
    if (removed > 0) {
      logger.info(`Cleaned up ${removed} cached blog posts`);
    }
  } catch (error) {
    logger.error('Failed to cleanup blog cache:', error);
  }
}

// Auto-cleanup on app start
export function initBlogCache(): void {
  if (isBlogCacheAvailable()) {
    cleanupBlogCache();
    logger.info('Blog cache initialized');
  }
}
