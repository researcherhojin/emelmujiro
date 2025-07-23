import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';

const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    const menuItems = [
        {
            path: 'services',
            text: 'AI 서비스',
            isScroll: true,
            description: '최신 AI 교육 서비스',
        },
        {
            path: 'about',
            text: '협력 사례',
            isScroll: true,
            description: '주요 기업 협력',
        },
        {
            path: 'lecture-career',
            text: '교육 이력',
            isScroll: true,
            description: '강의 및 프로젝트',
        },
        {
            path: 'education',
            text: '교육 과정',
            isScroll: true,
            description: '실무 중심 교육',
        },
        {
            path: 'blog',
            text: 'AI 트렌드',
            isScroll: false,
            description: '최신 AI 동향',
        },
        {
            path: 'contact',
            text: '도입 문의',
            isScroll: false,
            description: '무료 상담 신청',
        },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleMenuToggle = useCallback(() => {
        setIsMenuOpen((prev) => !prev);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    const handleScrollNavigation = useCallback(
        (e, path) => {
            e.preventDefault();
            if (location.pathname !== '/') {
                window.location.href = `/#${path}`;
            }
        },
        [location.pathname]
    );

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 
                        ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}
        >
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {location.pathname === '/' ? (
                        <button
                            onClick={scrollToTop}
                            className={`text-2xl font-bold transition-colors
                                ${isScrolled ? 'text-indigo-600' : 'text-white'}`}
                        >
                            에멜무지로
                        </button>
                    ) : (
                        <Link to="/" className="text-2xl font-bold text-indigo-600">
                            에멜무지로
                        </Link>
                    )}

                    {/* 데스크톱 메뉴 */}
                    <div className="hidden md:flex space-x-8">
                        {menuItems.map((item) =>
                            item.isScroll && location.pathname === '/' ? (
                                <ScrollLink
                                    key={item.path}
                                    to={item.path}
                                    spy={true}
                                    smooth={true}
                                    duration={500}
                                    offset={-64}
                                    className={`cursor-pointer transition-colors
                                        ${
                                            isScrolled
                                                ? 'text-gray-600 hover:text-indigo-600'
                                                : 'text-white/90 hover:text-white'
                                        }`}
                                >
                                    {item.text}
                                </ScrollLink>
                            ) : (
                                <Link
                                    key={item.path}
                                    to={item.path === '/' ? '/' : `/${item.path}`}
                                    className={`transition-colors ${
                                        location.pathname !== '/' || isScrolled
                                            ? 'text-gray-600 hover:text-indigo-600'
                                            : 'text-white/90 hover:text-white'
                                    }`}
                                    onClick={(e) => (item.isScroll ? handleScrollNavigation(e, item.path) : undefined)}
                                >
                                    {item.text}
                                </Link>
                            )
                        )}
                    </div>

                    {/* 모바일 메뉴 버튼 */}
                    <button
                        onClick={handleMenuToggle}
                        className={`md:hidden p-2 rounded-lg transition-colors ${
                            isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                        }`}
                        aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                    >
                        {isMenuOpen ? (
                            <X className={isScrolled ? 'text-gray-600' : 'text-white'} />
                        ) : (
                            <Menu className={isScrolled ? 'text-gray-600' : 'text-white'} />
                        )}
                    </button>
                </div>
            </div>

            {/* 모바일 메뉴 */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-40 md:hidden pt-16">
                    <div className="p-4 space-y-4">
                        {menuItems.map((item) => (
                            <div key={item.path} className="group">
                                {item.isScroll && location.pathname === '/' ? (
                                    <ScrollLink
                                        to={item.path}
                                        spy={true}
                                        smooth={true}
                                        duration={500}
                                        offset={-64}
                                        className="block py-3 hover:bg-gray-50 rounded-lg px-4 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span
                                            className="block text-lg font-medium text-gray-800 
                                   group-hover:text-indigo-600"
                                        >
                                            {item.text}
                                        </span>
                                        <span className="text-sm text-gray-500 mt-1">{item.description}</span>
                                    </ScrollLink>
                                ) : (
                                    <Link
                                        to={item.path === '/' ? '/' : `/${item.path}`}
                                        className="block py-3 hover:bg-gray-50 rounded-lg px-4 transition-colors"
                                        onClick={(e) => {
                                            setIsMenuOpen(false);
                                            if (item.isScroll) handleScrollNavigation(e, item.path);
                                        }}
                                    >
                                        <span
                                            className="block text-lg font-medium text-gray-800 
                                   group-hover:text-indigo-600"
                                        >
                                            {item.text}
                                        </span>
                                        <span className="text-sm text-gray-500 mt-1">{item.description}</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
