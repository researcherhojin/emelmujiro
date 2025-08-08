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
import SEOHelmet from './components/common/SEOHelmet';
import StructuredData from './components/common/StructuredData';

// Main page components - lazy load for better performance
const HeroSection = lazy(() => import('./components/sections/HeroSection'));
const QuickIntroSection = lazy(() => import('./components/sections/QuickIntroSection'));
const ServicesSection = lazy(() => import('./components/sections/ServicesSection'));
const LogosSection = lazy(() => import('./components/sections/LogosSection'));
const CTASection = lazy(() => import('./components/sections/CTASection'));

// Lazy load pages for code splitting
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));
const BlogListPage = lazy(() => import('./components/blog/BlogListPage'));
const BlogDetail = lazy(() => import('./components/blog/BlogDetail'));
const BlogEditor = lazy(() => import('./components/blog/BlogEditor'));

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
      <SEOHelmet
        title="AI 기반 소프트웨어 개발 및 IT 교육 전문가"
        description="최신 기술로 비즈니스의 미래를 설계합니다. AI, 머신러닝, 딥러닝을 활용한 맞춤형 솔루션을 제공합니다."
        url="https://researcherhojin.github.io/emelmujiro"
      />
      <StructuredData type="Organization" />
      <StructuredData type="Website" />
      <StructuredData type="Breadcrumb" />
      <div className="min-h-screen">
        <Suspense fallback={<PageLoading />}>
          {/* Hero Section */}
          <div id="home">
            <HeroSection />
          </div>

          {/* Quick Company Introduction */}
          <QuickIntroSection />

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
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/new', element: <BlogEditor /> },
      { path: 'blog/:id', element: <BlogDetail /> },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <UIProvider>
          <AuthProvider>
            <BlogProvider>
              <FormProvider>
                <RouterProvider router={router} />
              </FormProvider>
            </BlogProvider>
          </AuthProvider>
        </UIProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
