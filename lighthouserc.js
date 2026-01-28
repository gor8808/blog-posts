module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      autodiscoverUrlBlocklist: ['/tags/', '/categories/', '/contributors/', '/404.html'],
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'html-has-lang': 'error',

        // Warn only (not critical)
        'errors-in-console': 'warn',

        // Disable noisy checks
        'valid-source-maps': 'off',
        'first-contentful-paint': 'off',
        'largest-contentful-paint': 'off',
        'speed-index': 'off',
        'unused-css-rules': 'off',
        'unused-javascript': 'off',

        // Categories (minimum scores)
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
