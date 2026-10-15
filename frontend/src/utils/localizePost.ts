import type { BlogPost } from '../types';

/**
 * Whether a post has a complete English version. The backend's
 * `BlogPost.is_translated` is the definition (title, description and body all
 * non-blank); the field checks here only guard against an inconsistent
 * payload. A missing flag — an API older than the field, which is what the
 * frontend build sees during the deploy that introduces it — reads as
 * untranslated.
 */
export function isTranslated(post: BlogPost | null | undefined): boolean {
  return Boolean(
    post?.is_translated === true &&
    post.title_en?.trim() &&
    post.description_en?.trim() &&
    post.content_html_en?.trim()
  );
}

/**
 * The post as a reader in `lang` should see it: English fields swapped in on
 * an English route when a translation exists, the Korean original otherwise.
 * Untranslated posts render their Korean body on /en, and SEOHelmet
 * canonicalizes those to the Korean URL (`translated={false}`).
 */
export function localizePost(post: BlogPost, lang: string | undefined): BlogPost {
  if (!lang?.startsWith('en') || !isTranslated(post)) return post;
  return {
    ...post,
    title: post.title_en as string,
    description: post.description_en as string,
    content_html: post.content_html_en,
    tags: post.tags_en && post.tags_en.length > 0 ? post.tags_en : post.tags,
  };
}
