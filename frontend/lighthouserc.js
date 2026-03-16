module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx vite preview --port 4173',
      startServerReadyPattern: 'Local:',
      url: [
        'http://localhost:4173/emelmujiro/',
        'http://localhost:4173/emelmujiro/#/about',
        'http://localhost:4173/emelmujiro/#/contact',
        'http://localhost:4173/emelmujiro/#/profile',
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
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        // Timing metrics use warn — CI runners have variable CPU speed
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }],
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        label: 'error',
        // Relaxed rules for development / static hosting
        'uses-http2': 'off',
        'uses-long-cache-ttl': 'off',
        'robots-txt': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
