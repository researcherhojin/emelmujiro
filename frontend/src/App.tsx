import React, { lazy, Suspense, useEffect, memo } from 'react';
import {
  createHashRouter,
  RouterProvider,
  useLocation,
  Outlet,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BlogProvider } from './contexts/BlogContext';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { FormProvider } from './contexts/FormContext';
import { ChatProvider } from './contexts/ChatContext';
import Layout from './components/layout/Layout';
import { PageLoading } from './components/common/UnifiedLoading';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initializePWA } from './utils/pwaUtils';
import { initBlogCache } from './utils/blogCache';
import './i18n';

// Lazy load even more components for better code splitting
const SEOHelmet = lazy(() => import('./components/common/SEOHelmet'));
const StructuredData = lazy(() => import('./components/common/StructuredData'));
const WebVitalsDashboard = lazy(
  () => import('./components/common/WebVitalsDashboard')
);

// Main page components - lazy load for better performance
const HeroSection = lazy(() => import('./components/sections/HeroSection'));
const ServicesSection = lazy(
  () => import('./components/sections/ServicesSection')
);
const LogosSection = lazy(() => import('./components/sections/LogosSection'));
const CTASection = lazy(() => import('./components/sections/CTASection'));

// Lazy load pages for code splitting
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const SharePage = lazy(() => import('./components/pages/SharePage'));
const BlogListPage = lazy(() => import('./components/blog/BlogListPage'));
const BlogDetail = lazy(() => import('./components/blog/BlogDetail'));
const BlogEditor = lazy(() => import('./components/blog/BlogEditor'));
const NotFound = lazy(() => import('./components/common/NotFound'));

// PWA Components
const OfflineIndicator = lazy(
  () => import('./components/common/OfflineIndicator')
);
const NotificationPrompt = lazy(
  () => import('./components/common/NotificationPrompt')
);
const InstallPrompt = lazy(() => import('./components/common/InstallPrompt'));

// Chat Components
const ChatWidget = lazy(() => import('./components/chat/ChatWidget'));

// Admin Components
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

// ScrollToTop component to handle page navigation
const ScrollToTop: React.FC = memo(() => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
});

ScrollToTop.displayName = 'ScrollToTop';

const HomePage: React.FC = memo(() => {
  return (
    <>
      <Suspense fallback={null}>
        <SEOHelmet
          title="AI 기반 소프트웨어 개발 및 IT 교육 전문가"
          description="최신 기술로 비즈니스의 미래를 설계합니다. AI, 머신러닝, 딥러닝을 활용한 맞춤형 솔루션을 제공합니다."
          url="https://researcherhojin.github.io/emelmujiro"
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

          {/* Partner Logos */}
          <LogosSection />

          {/* Call to Action */}
          <CTASection />
        </Suspense>
      </div>
    </>
  );
});

HomePage.displayName = 'HomePage';

// App Layout component that includes the accessibility-enhanced layout
const AppLayout: React.FC = memo(() => {
  return (
    <Layout>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>

      {/* PWA Components */}
      <Suspense fallback={null}>
        <OfflineIndicator />
      </Suspense>
      <Suspense fallback={null}>
        <NotificationPrompt />
      </Suspense>
      <Suspense fallback={null}>
        <InstallPrompt />
      </Suspense>

      {/* Development tools */}
      <Suspense fallback={null}>
        <WebVitalsDashboard />
      </Suspense>

      {/* Chat Widget */}
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </Layout>
  );
});

AppLayout.displayName = 'AppLayout';

// Create router
const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'share', element: <SharePage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/new', element: <BlogEditor /> },
      { path: 'blog/:id', element: <BlogDetail /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// Initialize once outside of component to prevent duplicate calls in StrictMode
let pwaInitialized = false;
if (!pwaInitialized) {
  pwaInitialized = true;
  // Initialize PWA features
  initializePWA();
  // Initialize blog cache
  initBlogCache();
}

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <UIProvider>
          <AuthProvider>
            <BlogProvider>
              <FormProvider>
                <ChatProvider>
                  <RouterProvider router={router} />
                </ChatProvider>
              </FormProvider>
            </BlogProvider>
          </AuthProvider>
        </UIProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
