// Optional plugins - will be loaded only if available
let TerserPlugin;
let CompressionPlugin;

try {
  TerserPlugin = require('terser-webpack-plugin');
} catch (e) {
  console.log('TerserPlugin not found, using default optimization');
}

try {
  CompressionPlugin = require('compression-webpack-plugin');
} catch (e) {
  console.log('CompressionPlugin not found, skipping compression');
}

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Production optimizations
      if (process.env.NODE_ENV === 'production') {
        // Optimize bundle splitting
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            minSize: 20000,
            cacheGroups: {
              // Vendor splitting
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                  const packageName = module.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                  )[1];
                  return `vendor.${packageName.replace('@', '')}`;
                },
                priority: 10,
              },
              // Common chunks
              common: {
                minChunks: 2,
                priority: 5,
                reuseExistingChunk: true,
              },
              // React-related
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                name: 'react-vendor',
                priority: 20,
              },
              // Framer Motion
              framer: {
                test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                name: 'framer-motion',
                priority: 15,
              },
              // i18n
              i18n: {
                test: /[\\/]node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector|i18next-http-backend)[\\/]/,
                name: 'i18n',
                priority: 15,
              },
              // Icons
              icons: {
                test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
                name: 'icons',
                priority: 15,
              },
              // Markdown
              markdown: {
                test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|unified|remark|rehype)[\\/]/,
                name: 'markdown',
                priority: 15,
              },
            },
          },
          minimize: true,
          minimizer: TerserPlugin
            ? [
                new TerserPlugin({
                  terserOptions: {
                    parse: {
                      ecma: 8,
                    },
                    compress: {
                      ecma: 5,
                      warnings: false,
                      comparisons: false,
                      inline: 2,
                      drop_console: true,
                      drop_debugger: true,
                      pure_funcs: ['console.log', 'console.debug'],
                    },
                    mangle: {
                      safari10: true,
                    },
                    output: {
                      ecma: 5,
                      comments: false,
                      ascii_only: true,
                    },
                  },
                }),
              ]
            : [],
        };

        // Add compression plugin if available
        if (CompressionPlugin) {
          webpackConfig.plugins.push(
            new CompressionPlugin({
              algorithm: 'gzip',
              test: /\.(js|css|html|svg)$/,
              threshold: 8192,
              minRatio: 0.8,
            })
          );
        }
      }

      // Module resolution optimizations
      // Remove aliases that cause issues with modern React versions

      return webpackConfig;
    },
  },
};
