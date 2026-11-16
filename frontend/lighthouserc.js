module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx vite preview --port 4173',
      // Not 'Local:': Vite colors the word, so an ANSI reset sits between
      // it and the colon, and LHCI timed out (10 s) on every run.
      startServerReadyPattern: 'Local',
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/contact',
        'http://localhost:4173/profile',
        'http://localhost:4173/insights',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Timing metrics use warn — CI runners have variable CPU speed
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        interactive: ['warn', { maxNumericValue: 5000 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        // Accessibility
        'color-contrast': 'warn',
        'image-alt': 'error',
        label: 'error',
        // Relaxed rules for development / static hosting. Lighthouse 13 audit IDs
        // throughout: LHCI maps a dropped ID to its replacement only until "a future
        // version", and skips the mapping when the replacement is set explicitly.
        'modern-http-insight': 'off', // was uses-http2
        'cache-insight': 'off', // was uses-long-cache-ttl
        'robots-txt': 'off',
        // CI-specific relaxations — these fail in CI but pass in production
        canonical: 'off', // No backend serving canonical in CI preview
        'errors-in-console': 'error', // CI runs a backend and no analytics, so all 4 pages score 1 (run 39899543778); an error now is a real one
        'inspector-issues': 'warn',
        'legacy-javascript-insight': 'error', // was legacy-javascript
        'document-latency-insight': 'off', // was uses-text-compression: vite preview has no gzip; production nginx compresses
        // Bundle size insights — warn only, not block
        'total-byte-weight': 'warn',
        'unused-javascript': 'warn',
        // Lighthouse 13 flags the one shared Tailwind stylesheet on every route but `/`
        // (13,924 B, ~77% unused per page on #766's run); one cached sheet is the design.
        'unused-css-rules': 'warn',
        'network-dependency-tree-insight': 'off',
        // Was `off`, which also voided the `render-blocking-resources` warn LHCI maps
        // onto it. Every run scores 0.5: one shared stylesheet, 0 ms FCP/LCP savings
        // (12 of 12 on run 43786290084). A metric-savings audit scores 0 only when
        // savings are real, so minScore 0.5 warns on that regression; maxLength
        // overrides the preset's 0 (options merge) and warns on a second resource.
        'render-blocking-insight': ['warn', { minScore: 0.5, maxLength: 1 }],
        // Image optimization insights — CI serves unoptimized static assets. Also
        // covers the dropped efficient-animated-content, uses-responsive-images and
        // modern-image-formats, whose mapped `warn`s this explicit `off` voided.
        'image-delivery-insight': 'off',
        // CLS can spike in CI due to lazy-loaded components without backend
        'cls-culprits-insight': 'off',
        // Accessibility — CI preview may render differently than production
        'label-content-name-mismatch': 'warn',
        'aria-allowed-role': 'warn',
        // DOM size insight — informational only
        'dom-size-insight': 'off',
        // Font display — Pretendard CDN may not set font-display in CI
        'font-display-insight': 'off',
        // Third-party cookies — GA removed; Sentry lazy-loaded
        'third-party-cookies': 'warn',
        // LCP insights — CI preview server behaves differently. Also covers the
        // dropped prioritize-lcp-image and lcp-lazy-loaded (blog images are dynamic).
        'lcp-discovery-insight': 'off',
        'forced-reflow-insight': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
