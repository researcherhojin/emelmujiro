import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
            {/* Clean geometric background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-gray-50"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-white"></div>
                {/* Subtle accent line */}
                <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-200"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-0">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-left"
                    >
                        {/* Simple text badge */}
                        <div className="inline-block mb-6">
                            <span className="text-sm font-medium text-gray-500 tracking-wide uppercase">
                                AI Education & Consulting
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 text-gray-900 leading-[1.1]">
                            <span className="block">실무에 강한</span>
                            <span className="block text-black mt-1 relative">
                                AI 전문가 그룹
                                <div className="absolute -bottom-2 left-0 w-20 h-1.5 bg-gray-900 rounded-full"></div>
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 leading-relaxed max-w-2xl">
                            대기업 AI 교육부터 스타트업 기술 컨설팅까지,<br/>
                            맞춤형 솔루션으로 비즈니스 성장을 가속화합니다.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate('/contact')}
                                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-black text-white text-base sm:text-lg font-semibold 
                                    rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-100"
                            >
                                프로젝트 문의하기
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>

                            <button
                                onClick={() => navigate('/about')}
                                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-gray-300
                                    text-gray-700 text-base sm:text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all hover:border-gray-400"
                            >
                                회사 소개
                            </button>
                        </div>

                        {/* 빈 공간으로 균형 조정 */}
                        <div className="mt-12"></div>
                    </motion.div>

                    {/* Right content - Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 sm:p-8 lg:p-12 border border-gray-200">
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                <div>
                                    <div className="text-4xl sm:text-5xl font-black text-black mb-2 tracking-tight">1,000+</div>
                                    <div className="text-base sm:text-lg text-gray-600 font-medium">교육 수료생</div>
                                </div>
                                <div>
                                    <div className="text-4xl sm:text-5xl font-black text-black mb-2 tracking-tight">50+</div>
                                    <div className="text-base sm:text-lg text-gray-600 font-medium">프로젝트 완료</div>
                                </div>
                                <div>
                                    <div className="text-4xl sm:text-5xl font-black text-black mb-2 tracking-tight">15+</div>
                                    <div className="text-base sm:text-lg text-gray-600 font-medium">파트너 기업</div>
                                </div>
                                <div>
                                    <div className="text-4xl sm:text-5xl font-black text-black mb-2 tracking-tight">98%</div>
                                    <div className="text-base sm:text-lg text-gray-600 font-medium">고객 만족도</div>
                                </div>
                            </div>
                            
                            {/* Achievement badge */}
                            <div className="mt-8 pt-6 border-t border-gray-300/50">
                                <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">3년간의 AI 교육 전문성</span>
                                    <span className="text-xs text-gray-500 ml-2">(2022-Present)</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;