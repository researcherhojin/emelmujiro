import React, { lazy, Suspense, useEffect, memo } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useParams,
  Outlet,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { BlogProvider } from './contexts/BlogContext';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import { PageLoading } from './components/common/UnifiedLoading';
import ErrorBoundary from './components/common/ErrorBoundary';
import { SITE_URL } from './utils/constants';
import { trackPageView } from './utils/analytics';
import './i18n';

// Lazy load even more components for better code splitting
const SEOHelmet = lazy(() => import('./components/common/SEOHelmet'));
const StructuredData = lazy(() => import('./components/common/StructuredData'));
const WebVitalsDashboard = lazy(() => import('./components/common/WebVitalsDashboard'));

// Main page components - lazy load for better performance
const HeroSection = lazy(() => import('./components/sections/HeroSection'));
const ServicesSection = lazy(() => import('./components/sections/ServicesSection'));
const LogosSection = lazy(() => import('./components/sections/LogosSection'));
const CTASection = lazy(() => import('./components/sections/CTASection'));

// Lazy load pages for code splitting
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const SharePage = lazy(() => import('./components/pages/SharePage'));
const NotFound = lazy(() => import('./components/common/NotFound'));
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const BlogListPage = lazy(() => import('./components/blog/BlogListPage'));
const BlogDetail = lazy(() => import('./components/blog/BlogDetail'));
const BlogEditor = lazy(() => import('./components/blog/BlogEditor'));

// ScrollToTop component to handle page navigation
const ScrollToTop: React.FC = memo(() => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(pathname);
  }, [pathname]);

  return null;
});

ScrollToTop.displayName = 'ScrollToTop';

const HomePage: React.FC = memo(() => {
  const { t } = useTranslation();
  return (
    <>
      <Suspense fallback={null}>
        <SEOHelmet
          title={t('seo.site.title')}
          description={t('seo.site.description')}
          url={SITE_URL}
        />
        <StructuredData type="Organization" />
        <StructuredData type="Website" />
        <StructuredData type="LocalBusiness" />
        <StructuredData type="Service" />
        <StructuredData type="SearchAction" />
        <StructuredData type="Breadcrumb" />
      </Suspense>
      <div className="min-h-screen">
        <Suspense fallback={<PageLoading />}>
          {/* Hero Section */}
          <div id="home">
            <HeroSection />
          </div>

          {/* Services Section */}
          <div id="services">
            <ServicesSection />
          </div>

          {/* Partner Logos + Achievement Pills */}
          <LogosSection />

          {/* Call to Action */}
          <CTASection />
        </Suspense>
      </div>
    </>
  );
});

HomePage.displayName = 'HomePage';

/**
 * LanguageLayout — Sets i18n language based on the :lang URL param.
 * Korean (default): no prefix. English: /en prefix.
 */
const LanguageLayout: React.FC = memo(() => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const targetLang = lang || 'ko';

  useEffect(() => {
    if (i18n.language !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
    document.documentElement.lang = targetLang;
  }, [targetLang, i18n]);

  return <Outlet />;
});

LanguageLayout.displayName = 'LanguageLayout';

// App Layout component that includes the accessibility-enhanced layout
const AppLayout: React.FC = memo(() => {
  // Signal to index.html fallback scripts that visible content rendered.
  // Must be here (inside the router layout), NOT as a sibling to RouterProvider,
  // because we need to confirm that the layout (Navbar, Footer, page content)
  // actually mounted — not just that the provider tree initialized.
  useEffect(() => {
    window.__appLoaded = true;
  }, []);

  return (
    <Layout>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>

      {/* Development tools */}
      <Suspense fallback={null}>
        <WebVitalsDashboard />
      </Suspense>
    </Layout>
  );
});

AppLayout.displayName = 'AppLayout';

// Page routes shared between default (ko) and /en layouts
const pageRoutes = [
  { index: true, element: <HomePage /> },
  { path: 'about', element: <AboutPage /> },
  { path: 'contact', element: <ContactPage /> },
  { path: 'profile', element: <ProfilePage /> },
  { path: 'share', element: <SharePage /> },
  { path: 'blog', element: <BlogListPage /> },
  { path: 'blog/new', element: <BlogEditor /> },
  { path: 'blog/edit/:id', element: <BlogEditor /> },
  { path: 'blog/:id', element: <BlogDetail /> },
  { path: '*', element: <NotFound /> },
];

// Create router with language-prefixed routes
const router = createBrowserRouter([
  {
    element: <LanguageLayout />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: pageRoutes,
      },
    ],
  },
  {
    path: '/:lang',
    element: <LanguageLayout />,
    children: [
      {
        element: <AppLayout />,
        children: pageRoutes,
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <UIProvider>
          <AuthProvider>
            <NotificationProvider>
              <BlogProvider>
                <RouterProvider router={router} />
              </BlogProvider>
            </NotificationProvider>
          </AuthProvider>
        </UIProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
