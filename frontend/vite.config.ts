import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// Strip localhost CSP entries from production builds
function stripLocalhostCsp(): import('vite').Plugin {
  return {
    name: 'strip-localhost-csp',
    transformIndexHtml(html, ctx) {
      if (ctx.bundle) {
        // Production build: remove localhost/127.0.0.1 from CSP connect-src
        return html.replace(
          /http:\/\/localhost:8000\s*/g,
          ''
        ).replace(
          /http:\/\/127\.0\.0\.1:8000\s*/g,
          ''
        );
      }
      return html;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'Chrome >= 64', 'Samsung >= 9.2'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    tsconfigPaths(),
    stripLocalhostCsp(),
  ],
  base: '/emelmujiro/',
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    target: ['chrome64', 'safari12', 'firefox63', 'edge79'],
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Define global constants for compatibility
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
    'process.env.PUBLIC_URL': JSON.stringify('/emelmujiro'),
  },
});
