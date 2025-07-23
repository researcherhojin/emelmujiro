import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PageLoading from './components/common/PageLoading';

// Main page components
import HeroSection from './components/sections/HeroSection';
import QuickIntroSection from './components/sections/QuickIntroSection';
import ServicesSection from './components/sections/ServicesSection';
import LogosSection from './components/sections/LogosSection';
import CTASection from './components/sections/CTASection';

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
    );
}

function App() {
    return (
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
            </div>
        </Router>
    );
}

export default App;