const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper MIME types and handling for web
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Set proper MIME type for JavaScript bundles
      if (req.url.includes('.bundle') || req.url.includes('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      }
      return middleware(req, res, next);
    };
  },
};

// Add support for TypeScript
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

module.exports = config;