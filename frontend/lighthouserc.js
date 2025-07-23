module.exports = {
  ci: {
    collect: {
      staticDistDir: './build',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/#/about',
        'http://localhost:3000/#/contact',
        'http://localhost:3000/#/profile'
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
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.9 }],
        
        // Specific metric assertions
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // PWA specific
        'service-worker': 'error',
        'works-offline': 'warn',
        'installable-manifest': 'error',
        
        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        
        // Relaxed rules for development
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