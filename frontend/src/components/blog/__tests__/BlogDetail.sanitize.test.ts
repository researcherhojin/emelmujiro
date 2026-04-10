import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

// Sanitization config used by BlogDetail.tsx for rendering blog content_html.
// If that call site changes, this config must stay in sync OR BlogDetail should
// import from here. Keeping the constant local to the test for now to avoid
// cross-cutting refactor.
const BLOG_HTML_SANITIZE_CONFIG = {
  ADD_TAGS: ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col'],
  ADD_ATTR: ['colspan', 'rowspan'],
};

const sanitize = (html: string) => DOMPurify.sanitize(html, BLOG_HTML_SANITIZE_CONFIG);

describe('BlogDetail HTML sanitization (real DOMPurify)', () => {
  it('strips <script> tags entirely', () => {
    const result = sanitize('<p>hi</p><script>alert(1)</script><p>bye</p>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>hi</p>');
    expect(result).toContain('<p>bye</p>');
  });

  it('strips javascript: URLs from href attributes', () => {
    const result = sanitize('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toMatch(/javascript:/i);
    // Anchor tag may remain but href is stripped or neutralized
    if (result.includes('<a')) {
      expect(result).not.toMatch(/href=["']javascript:/i);
    }
  });

  it('strips onerror handlers from <img>', () => {
    const result = sanitize('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('strips onclick handlers from normal elements', () => {
    const result = sanitize('<div onclick="alert(1)">hi</div>');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('alert');
  });

  it('strips <iframe> tags', () => {
    const result = sanitize('<iframe src="https://evil.example/"></iframe>');
    expect(result).not.toContain('<iframe');
  });

  it('strips <object> and <embed> tags', () => {
    const result = sanitize('<object data="evil.swf"></object><embed src="evil.swf">');
    expect(result).not.toContain('<object');
    expect(result).not.toContain('<embed');
  });

  it('strips SVG <script> payloads', () => {
    const result = sanitize('<svg><script>alert(1)</script></svg>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('strips data: URI scripts in href', () => {
    const result = sanitize('<a href="data:text/html,<script>alert(1)</script>">click</a>');
    expect(result).not.toMatch(/data:text\/html/i);
    expect(result).not.toContain('<script');
  });

  // Note: DOMPurify does NOT sanitize CSS inside `style` attributes — it only
  // validates HTML. `expression()` is an IE-only legacy vector not executable
  // in any current browser, so leaving it in style attributes is not a
  // current-browser XSS risk. What matters is that no <script> or event
  // handler can ride through — which the other tests cover.
  it('does not let <script> ride through via style attribute', () => {
    const result = sanitize('<div style="background: red"><script>alert(1)</script></div>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('preserves allowed formatting tags', () => {
    const result = sanitize('<p><strong>bold</strong> and <em>italic</em></p>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('preserves tables (allowed via ADD_TAGS for blog content)', () => {
    const html =
      '<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>d</td></tr></tbody></table>';
    const result = sanitize(html);
    expect(result).toContain('<table>');
    expect(result).toContain('<thead>');
    expect(result).toContain('<tbody>');
    expect(result).toContain('<th>h</th>');
    expect(result).toContain('<td>d</td>');
  });

  it('preserves table colspan/rowspan (allowed via ADD_ATTR)', () => {
    const html = '<table><tr><td colspan="2" rowspan="3">cell</td></tr></table>';
    const result = sanitize(html);
    expect(result).toMatch(/colspan=["']?2/);
    expect(result).toMatch(/rowspan=["']?3/);
  });

  it('preserves image tags with safe src', () => {
    const result = sanitize('<img src="https://example.com/pic.png" alt="pic">');
    expect(result).toContain('<img');
    expect(result).toContain('src="https://example.com/pic.png"');
  });

  it('strips nested mixed attacks (script inside allowed container)', () => {
    const result = sanitize(
      '<div><p><strong>ok</strong></p><script>alert(1)</script><p>ok2</p></div>'
    );
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<strong>ok</strong>');
    expect(result).toContain('<p>ok2</p>');
  });
});
