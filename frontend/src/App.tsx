import React, { lazy, Suspense, useEffect, memo } from 'react';
import { createHashRouter, RouterProvider, useLocation, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BlogProvider } from './contexts/BlogContext';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { FormProvider } from './contexts/FormContext';
import Layout from './components/layout/Layout';
import { PageLoading } from './components/common/UnifiedLoading';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';
import { SITE_URL } from './utils/constants';
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
const UnderConstruction = lazy(() => import('./components/common/UnderConstruction'));

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
        <SEOHelmet url={SITE_URL} />
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

      {/* Development tools */}
      <Suspense fallback={null}>
        <WebVitalsDashboard />
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
      { path: 'blog', element: <UnderConstruction featureKey="blog" /> },
      { path: 'blog/new', element: <UnderConstruction featureKey="blog" /> },
      { path: 'blog/:id', element: <UnderConstruction featureKey="blog" /> },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

// Signal to index.html fallback scripts that the app rendered successfully
function AppLoaded() {
  useEffect(() => {
    window.__appLoaded = true;
  }, []);
  return null;
}

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <UIProvider>
          <AuthProvider>
            <BlogProvider>
              <FormProvider>
                <RouterProvider router={router} />
                <AppLoaded />
              </FormProvider>
            </BlogProvider>
          </AuthProvider>
        </UIProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
