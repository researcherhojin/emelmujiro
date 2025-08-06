import React, { lazy, Suspense, useEffect, memo } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BlogProvider } from './contexts/BlogContext';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { FormProvider } from './contexts/FormContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PageLoading from './components/common/PageLoading';
import PWAInstallButton from './components/common/PWAInstallButton';
import NotificationPermission from './components/common/NotificationPermission';
import NotificationContainer from './components/common/NotificationContainer';
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

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <UIProvider>
        <AuthProvider>
          <BlogProvider>
            <FormProvider>
              <Router>
                <div className="App">
                  <ScrollToTop />
                  <Navbar />
                  <main className="min-h-screen">
                    <Suspense fallback={<PageLoading />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/blog" element={<BlogListPage />} />
                        <Route path="/blog/new" element={<BlogEditor />} />
                        <Route path="/blog/:id" element={<BlogDetail />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  <PWAInstallButton />
                  <NotificationPermission />
                  <NotificationContainer />
                </div>
              </Router>
            </FormProvider>
          </BlogProvider>
        </AuthProvider>
      </UIProvider>
    </HelmetProvider>
  );
};

export default App;
