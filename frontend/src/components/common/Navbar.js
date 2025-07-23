import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: '회사소개', path: '/about' },
        { label: '서비스', path: '/#services' },
        { label: '대표 프로필', path: '/profile' }
    ];

    const handleNavigation = (path) => {
        setIsOpen(false);
        
        if (path.startsWith('/#')) {
            // 홈페이지의 특정 섹션으로 이동
            const sectionId = path.substring(2);
            if (location.pathname !== '/') {
                // 다른 페이지에 있다면 홈으로 이동 후 스크롤
                navigate('/');
                setTimeout(() => {
                    const element = document.getElementById(sectionId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } else {
                // 이미 홈페이지에 있다면 바로 스크롤
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        } else {
            // 일반 페이지로 이동
            navigate(path);
        }
    };

    const isActive = (path) => {
        if (path.startsWith('/#')) {
            return location.pathname === '/' && location.hash === path.substring(1);
        }
        return location.pathname === path;
    };

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-white shadow-lg border-b border-gray-200'
                    : 'bg-white/98 backdrop-blur-sm shadow-sm border-b border-gray-100'
            }`}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <button 
                        onClick={() => navigate('/')}
                        className="text-2xl font-black text-gray-900 hover:text-gray-700 transition-colors tracking-tight select-none cursor-pointer"
                    >
                        에멜무지로
                    </button>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-12">
                        {navItems.map((item, index) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`text-base font-medium transition-all duration-200 relative ${
                                    isActive(item.path) 
                                        ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gray-900 after:rounded-full' 
                                        : 'text-gray-600 hover:text-gray-900 hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-gray-300 hover:after:rounded-full'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => navigate('/contact')}
                            className="px-6 py-3 bg-gray-900 text-white text-base font-semibold 
                                rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
                        >
                            문의하기
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden inline-flex items-center justify-center p-2 text-gray-700 
                            hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95"
                        aria-label="메뉴 토글"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-4 py-6 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`block w-full text-left px-4 py-3 text-base font-medium 
                                    transition-colors ${
                                    isActive(item.path)
                                        ? 'text-gray-900 bg-gray-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}

                        <div className="pt-4">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/contact');
                                }}
                                className="w-full px-4 py-4 bg-gray-900 text-white text-base 
                                    font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md active:scale-95"
                            >
                                문의하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default React.memo(Navbar);