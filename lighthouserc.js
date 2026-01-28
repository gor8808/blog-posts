module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      autodiscoverUrlBlocklist: ['/tags/', '/categories/', '/contributors/'],
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        // Structured data - fail build on JSON-LD errors
        'structured-data': 'error',

        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',

        // Disable noisy checks
        'valid-source-maps': 'off',
        'first-contentful-paint': 'off',
        'largest-contentful-paint': 'off',
        'speed-index': 'off',

        // Categories (minimum scores)
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
