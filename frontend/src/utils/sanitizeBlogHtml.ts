import DOMPurify from 'dompurify';

/**
 * Sanitize blog HTML content before rendering via dangerouslySetInnerHTML.
 *
 * Config rationale:
 * - ADD_TAGS: tables are allowed because blog posts can legitimately contain
 *   tabular data. DOMPurify's default allowlist omits table structure tags.
 * - ADD_ATTR: colspan/rowspan needed for non-trivial tables.
 * - FORBID_ATTR: style is stripped because TipTap extensions in use
 *   (StarterKit, Image, Link, Underline, TaskList/Item, Typography,
 *   CodeBlockLowlight) all emit class-based markup, never inline styles.
 *   Allowing inline style would permit CSS-based XSS vectors (e.g. the
 *   legacy IE `expression()` vector) without any legitimate content gain.
 *   Blog-wide styling comes from the `prose` container classes, not from
 *   per-element inline style.
 */
export const sanitizeBlogHtml = (html: string): string =>
  DOMPurify.sanitize(html, {
    ADD_TAGS: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col'],
    ADD_ATTR: ['colspan', 'rowspan'],
    FORBID_ATTR: ['style'],
  });
