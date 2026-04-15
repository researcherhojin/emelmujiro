#!/usr/bin/env node
/**
 * Detect CSS classes shipped in build/assets/*.css that have no literal
 * match in source. Tailwind's content scanner is usually accurate, but
 * template-literal patterns (`bg-${color}-600`), `@apply` drift, and dead
 * source files can leave classes in the shipped CSS that no component
 * references. knip catches dead modules; this catches dead CSS.
 *
 * Usage (run from frontend/):
 *   node scripts/check-css.js
 *   node scripts/check-css.js --json
 *
 * Exit codes:
 *   0 — no unused classes
 *   1 — unused classes detected (or build missing)
 */

const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

const FRONTEND = path.resolve(__dirname, '..');
const CSS_DIR = path.join(FRONTEND, 'build/assets');

// Files where classes may be referenced. index.html has classNames in the
// loading-fallback skeleton and noscript block that Tailwind still emits.
const SOURCE_ROOTS = [path.join(FRONTEND, 'src')];
const EXTRA_SOURCE_FILES = [path.join(FRONTEND, 'index.html')];
const SOURCE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.html']);
const SKIP_DIRS = new Set(['node_modules', '__tests__', '__mocks__']);

// Classes that are legitimately set outside of source scanning:
// - `dark` is applied to <html> by the theme-detection script in index.html
//   and by DarkModeToggle via documentElement.classList.add('dark')
// - `slow-connection` is applied imperatively by the network-detection inline
//   script in index.html
// - `group-hover:pause` is a runtime combined selector (group + hover) that
//   Tailwind serializes with `:` between them; individual `pause` usage is
//   in index.css media query overrides
const ALLOWLIST = new Set(['dark', 'slow-connection']);

function extractClassesFromCss(cssPath) {
  const root = postcss.parse(fs.readFileSync(cssPath, 'utf8'));
  const classes = new Set();
  root.walkRules((rule) => {
    try {
      selectorParser((selectors) => {
        selectors.walkClasses((node) => {
          classes.add(node.value);
        });
      }).processSync(rule.selector);
    } catch {
      // Ignore unparseable selectors (e.g. vendor-specific pseudo-selectors)
    }
  });
  return classes;
}

function collectSourceText() {
  let text = '';
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(path.join(dir, entry.name));
      } else if (SOURCE_EXTS.has(path.extname(entry.name))) {
        text += fs.readFileSync(path.join(dir, entry.name), 'utf8') + '\n';
      }
    }
  };
  for (const root of SOURCE_ROOTS) walk(root);
  for (const f of EXTRA_SOURCE_FILES) {
    if (fs.existsSync(f)) text += fs.readFileSync(f, 'utf8') + '\n';
  }
  return text;
}

function main() {
  const jsonMode = process.argv.includes('--json');

  if (!fs.existsSync(CSS_DIR)) {
    console.error(`Build CSS directory not found: ${CSS_DIR}`);
    console.error('Run `npm run build` (or build:no-prerender) first.');
    process.exit(1);
  }

  const cssFiles = fs
    .readdirSync(CSS_DIR)
    .filter((f) => f.endsWith('.css'))
    .map((f) => path.join(CSS_DIR, f));
  if (cssFiles.length === 0) {
    console.error(`No CSS files in ${CSS_DIR}.`);
    process.exit(1);
  }

  const allClasses = new Set();
  for (const f of cssFiles) {
    for (const c of extractClassesFromCss(f)) allClasses.add(c);
  }

  const source = collectSourceText();
  const unused = [];
  for (const cls of allClasses) {
    if (ALLOWLIST.has(cls)) continue;
    if (!source.includes(cls)) unused.push(cls);
  }
  unused.sort();

  if (jsonMode) {
    console.log(
      JSON.stringify(
        { scanned: allClasses.size, files: cssFiles.length, unused },
        null,
        2
      )
    );
  } else {
    console.log(`Scanned ${allClasses.size} CSS classes across ${cssFiles.length} file(s).`);
    if (unused.length === 0) {
      console.log('✅ No unused classes.');
    } else {
      console.log(`❌ ${unused.length} unused:`);
      for (const c of unused) console.log(`   ${c}`);
      console.log(
        '\nFalse positives? Add to the ALLOWLIST in scripts/check-css.js with a one-line reason.'
      );
    }
  }

  process.exit(unused.length === 0 ? 0 : 1);
}

main();
