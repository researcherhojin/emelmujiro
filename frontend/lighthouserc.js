module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx vite preview --port 4173',
      startServerReadyPattern: 'Local:',
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
        // Relaxed rules for development / static hosting
        'uses-http2': 'off',
        'uses-long-cache-ttl': 'off',
        'robots-txt': 'off',
        // CI-specific relaxations — these fail in CI but pass in production
        canonical: 'off', // No backend serving canonical in CI preview
        'errors-in-console': 'warn', // Console errors from missing API in CI
        'inspector-issues': 'warn',
        'legacy-javascript': 'error',
        'uses-text-compression': 'off', // vite preview has no gzip; production nginx compresses
        // Blog images are external URLs (author-controlled content, not code)
        'efficient-animated-content': 'warn',
        'prioritize-lcp-image': 'warn', // LCP image is dynamic blog content, can't statically preload
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
        // Accessibility — CI preview may render differently than production
        'label-content-name-mismatch': 'warn',
        'aria-allowed-role': 'warn',
        // DOM size insight — informational only
        'dom-size-insight': 'off',
        // Font display — Pretendard CDN may not set font-display in CI
        'font-display-insight': 'off',
        // Third-party cookies — GA removed; Sentry lazy-loaded
        'third-party-cookies': 'warn',
        // LCP insights — CI preview server behaves differently
        'lcp-discovery-insight': 'off',
        'lcp-lazy-loaded': 'warn',
        'forced-reflow-insight': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
