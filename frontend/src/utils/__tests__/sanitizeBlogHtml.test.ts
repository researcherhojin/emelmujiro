import { describe, it, expect } from 'vitest';
import { sanitizeBlogHtml } from '../sanitizeBlogHtml';

describe('sanitizeBlogHtml (real DOMPurify via shared config)', () => {
  // --- Active XSS vectors (must be stripped) ---

  it('strips <script> tags entirely', () => {
    const result = sanitizeBlogHtml('<p>hi</p><script>alert(1)</script><p>bye</p>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>hi</p>');
    expect(result).toContain('<p>bye</p>');
  });

  it('strips javascript: URLs from href attributes', () => {
    const result = sanitizeBlogHtml('<a href="javascript:alert(1)">click</a>');
    expect(result).not.toMatch(/javascript:/i);
  });

  it('strips onerror handlers from <img>', () => {
    const result = sanitizeBlogHtml('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('strips onclick handlers from normal elements', () => {
    const result = sanitizeBlogHtml('<div onclick="alert(1)">hi</div>');
    expect(result).not.toContain('onclick');
    expect(result).not.toContain('alert');
  });

  it('strips <iframe> tags', () => {
    const result = sanitizeBlogHtml('<iframe src="https://evil.example/"></iframe>');
    expect(result).not.toContain('<iframe');
  });

  it('strips <object> and <embed> tags', () => {
    const result = sanitizeBlogHtml('<object data="evil.swf"></object><embed src="evil.swf">');
    expect(result).not.toContain('<object');
    expect(result).not.toContain('<embed');
  });

  it('strips SVG <script> payloads', () => {
    const result = sanitizeBlogHtml('<svg><script>alert(1)</script></svg>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
  });

  it('strips data:text/html href', () => {
    const result = sanitizeBlogHtml('<a href="data:text/html,<script>alert(1)</script>">click</a>');
    expect(result).not.toMatch(/data:text\/html/i);
    expect(result).not.toContain('<script');
  });

  // --- Style attribute hardening (FORBID_ATTR: ['style']) ---

  it('strips inline style attributes entirely (belt-and-suspenders against CSS vectors)', () => {
    const result = sanitizeBlogHtml('<div style="background: red">content</div>');
    expect(result).not.toContain('style=');
  });

  it('strips legacy IE expression() CSS vector via style attribute removal', () => {
    const result = sanitizeBlogHtml('<div style="width: expression(alert(1))">x</div>');
    expect(result).not.toContain('expression(');
    expect(result).not.toContain('style=');
  });

  it('strips style attribute on <a>, <img>, <span> alike', () => {
    const result = sanitizeBlogHtml(
      '<a style="color:red" href="/x">l</a><img style="width:1px" src="y"><span style="font-size:99">z</span>'
    );
    expect(result).not.toContain('style=');
    // But the elements themselves are preserved (other attrs still work)
    expect(result).toContain('href="/x"');
    expect(result).toMatch(/src=["']?y/);
  });

  // --- Allowed content (must be preserved) ---

  it('preserves allowed formatting tags', () => {
    const result = sanitizeBlogHtml('<p><strong>bold</strong> and <em>italic</em></p>');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  it('preserves tables (allowed via ADD_TAGS for blog content)', () => {
    const html =
      '<table><thead><tr><th>h</th></tr></thead><tbody><tr><td>d</td></tr></tbody></table>';
    const result = sanitizeBlogHtml(html);
    expect(result).toContain('<table>');
    expect(result).toContain('<thead>');
    expect(result).toContain('<tbody>');
    expect(result).toContain('<th>h</th>');
    expect(result).toContain('<td>d</td>');
  });

  it('preserves table colspan/rowspan (allowed via ADD_ATTR)', () => {
    const html = '<table><tr><td colspan="2" rowspan="3">cell</td></tr></table>';
    const result = sanitizeBlogHtml(html);
    expect(result).toMatch(/colspan=["']?2/);
    expect(result).toMatch(/rowspan=["']?3/);
  });

  it('preserves image tags with safe src', () => {
    const result = sanitizeBlogHtml('<img src="https://example.com/pic.png" alt="pic">');
    expect(result).toContain('<img');
    expect(result).toContain('src="https://example.com/pic.png"');
  });

  // --- Mixed / nested attacks ---

  it('strips nested mixed attacks (script inside allowed container)', () => {
    const result = sanitizeBlogHtml(
      '<div><p><strong>ok</strong></p><script>alert(1)</script><p>ok2</p></div>'
    );
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<strong>ok</strong>');
    expect(result).toContain('<p>ok2</p>');
  });

  it('does not let <script> ride through via style sibling', () => {
    const result = sanitizeBlogHtml('<div style="background: red"><script>alert(1)</script></div>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).not.toContain('style=');
  });
});
