import DOMPurify from 'dompurify';

/**
 * Sanitize blog HTML content before rendering via dangerouslySetInnerHTML.
 *
 * Config rationale:
 * - FORBID_ATTR is the only option here, and it is the only one that ever did
 *   anything. This config used to also pass ADD_TAGS for the eight table
 *   structure tags and ADD_ATTR for colspan/rowspan, above a comment claiming
 *   "DOMPurify's default allowlist omits table structure tags". That is false.
 *   Measured on 2026-09-28 under the installed dompurify 3.4.16 in jsdom: a
 *   full table carrying all eight tags plus both attributes sanitizes to
 *   byte-identical output with the old config, with only FORBID_ATTR, and with
 *   bare defaults. All eight tags are already in the default ALLOWED_TAGS and
 *   both attributes in the default ALLOWED_ATTR, so the two options were
 *   no-ops restating the default. They were removed rather than kept as a
 *   "pin against upstream narrowing": a future security-driven narrowing of
 *   DOMPurify's allowlist should surface for review, not be silently
 *   overridden by an allowance nobody revisited. The review is what
 *   sanitizeBlogHtml.test.ts provides — its table cases assert the behavior
 *   directly, so a narrowed default turns them red here instead of shipping.
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
    FORBID_ATTR: ['style'],
  });
