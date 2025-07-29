import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PageLoading from './components/common/PageLoading';
import PWAInstallButton from './components/common/PWAInstallButton';
import NotificationPermission from './components/common/NotificationPermission';

// Main page components
import HeroSection from './components/sections/HeroSection';
import QuickIntroSection from './components/sections/QuickIntroSection';
import ServicesSection from './components/sections/ServicesSection';
import LogosSection from './components/sections/LogosSection';
import CTASection from './components/sections/CTASection';
import SEOHelmet from './components/common/SEOHelmet';
import StructuredData from './components/common/StructuredData';

// Lazy load pages for code splitting
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const ProfilePage = lazy(() => import('./components/pages/ProfilePage'));
const AboutPage = lazy(() => import('./components/pages/AboutPage'));

// ScrollToTop component to handle page navigation
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function HomePage() {
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
            </div>
        </>
    );
}

function App() {
    return (
        <HelmetProvider>
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
                            </Routes>
                        </Suspense>
                    </main>
                    <Footer />
                    <PWAInstallButton />
                    <NotificationPermission />
                </div>
            </Router>
        </HelmetProvider>
    );
}

export default App;