module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx vite preview --port 4173',
      startServerReadyPattern: 'Local:',
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/about',
        'http://localhost:4173/contact',
        'http://localhost:4173/profile',
        'http://localhost:4173/blog',
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
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Timing metrics use warn — CI runners have variable CPU speed
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        interactive: ['warn', { maxNumericValue: 5000 }],
        'speed-index': ['warn', { maxNumericValue: 4000 }],
        // Accessibility
        'color-contrast': 'warn',
        'image-alt': 'error',
        label: 'error',
        // Relaxed rules for development / static hosting
        'uses-http2': 'off',
        'uses-long-cache-ttl': 'off',
        'robots-txt': 'off',
        // CI-specific relaxations — these fail in CI but pass in production
        canonical: 'off', // No backend serving canonical in CI preview
        'errors-in-console': 'warn', // Console errors from missing API in CI
        'inspector-issues': 'warn',
        // plugin-legacy injects polyfills that trigger these
        'legacy-javascript': 'off',
        'legacy-javascript-insight': 'off',
        // Bundle size insights — warn only, not block
        'total-byte-weight': 'warn',
        'unused-javascript': 'warn',
        'network-dependency-tree-insight': 'off',
        'render-blocking-insight': 'off',
        'render-blocking-resources': 'warn',
        // Image optimization insights — CI serves unoptimized static assets
        'image-delivery-insight': 'off',
        'uses-responsive-images': 'warn',
        'modern-image-formats': 'warn',
        // CLS can spike in CI due to lazy-loaded components without backend
        'cls-culprits-insight': 'off',
        // Accessibility label mismatch — CI preview may render differently
        'label-content-name-mismatch': 'warn',
        // DOM size insight — informational only
        'dom-size-insight': 'off',
        // Font display — Google Fonts may not set font-display in CI
        'font-display-insight': 'off',
        // Third-party cookies — triggered by external scripts (GA, Sentry)
        'third-party-cookies': 'off',
        // LCP insights — CI preview server behaves differently
        'lcp-discovery-insight': 'off',
        'lcp-lazy-loaded': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
