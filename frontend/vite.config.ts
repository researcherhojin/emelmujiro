import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
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
    // Modern browser target — CLAUDE.md requires Node >= 24 and we self-host
    // on Mac mini for a Korean audience that's reliably on current Chrome/
    // Safari/Firefox. Shipping ES2022 avoids the legacy-javascript Lighthouse
    // warning (our own chunks were scoring 0.5 because Vite's default target
    // polyfilled modern syntax for hypothetical old browsers that never
    // visit this site). Regression guard: Lighthouse legacy-javascript audit
    // should be >=0.9 for /assets/*.js chunks after this change.
    target: 'es2022',
    // tiptap chunk is ~540 kB (170 kB gzipped) because it bundles @tiptap/*,
    // prosemirror, and lowlight (syntax highlighting grammars) for the blog
    // editor. BlogEditor is lazy-loaded via React.lazy at App.tsx:34 and
    // only reachable from admin routes /insights/new and /insights/edit/:id,
    // so regular users never pay this cost. The >500 kB default warning is
    // cosmetic here — raise to 600 kB so intentional chunks don't spam the
    // build log. Non-admin chunks all stay well under 200 kB.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            // react-router-dom@7 has react-router (core) as a runtime dependency;
            // without the `react-router/` match, core got a separate default chunk
            // that scored 71% unused in Lighthouse — consolidating into react-vendor
            // eliminates that duplicate chunk.
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react/')) {
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
