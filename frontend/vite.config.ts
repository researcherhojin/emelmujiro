import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
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
    stripLocalhostCsp(),
  ],
  base: '/',
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
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/framer-motion/') || id.includes('node_modules/lucide-react/')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/') || id.includes('node_modules/i18next-browser-languagedetector/') || id.includes('/src/i18n')) {
            return 'i18n';
          }
          if (id.includes('node_modules/@sentry/')) {
            return 'sentry';
          }
          if (id.includes('node_modules/axios/')) {
            return 'http-vendor';
          }
          if (id.includes('node_modules/dompurify/')) {
            return 'dompurify';
          }
          if (id.includes('node_modules/@tiptap/') || id.includes('node_modules/prosemirror-') || id.includes('node_modules/lowlight/')) {
            return 'tiptap';
          }
        },
      },
    },
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Define global constants for compatibility
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
    'process.env.PUBLIC_URL': JSON.stringify(''),
  },
});
