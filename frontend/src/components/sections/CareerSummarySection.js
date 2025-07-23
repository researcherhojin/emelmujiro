import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Building, Award, ArrowRight } from 'lucide-react';

const CareerSummarySection = () => {
    const navigate = useNavigate();

    const stats = [
        { label: '강의 경험', value: '50+', icon: BookOpen },
        { label: '파트너사', value: '15+', icon: Building },
        { label: '교육 기간', value: '4년', icon: Award },
    ];

    const highlights = [
        {
            year: '2025',
            title: '사업 확장 및 대학원 진학',
            description: 'AI 기술 전문성 강화와 비즈니스 성장',
        },
        {
            year: '2024',
            title: '대학원 진학 및 사업 성장',
            description: '한양대 AI융합대학원 진학, 기업 교육 확대',
        },
        {
            year: '2023',
            title: '교육 활동 전성기',
            description: '삼성전자, LG전자, 현대건설 등 대기업 AI 교육',
        },
        {
            year: '2022',
            title: 'AI 교육 전문가로 성장',
            description: '교육 콘텐츠 개발 및 기업 교육 전문가 활동',
        },
    ];

    const handleViewDetail = () => {
        navigate('/career');
    };

    return (
        <section id="career" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">실무 이력</h2>
                    <p className="text-xl text-gray-600 leading-relaxed">
                        AI 교육과 비즈니스 개발 분야에서 쌓아온 <strong className="text-gray-900">4년간의 경험</strong>
                        을 소개합니다.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {stats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <IconComponent className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Career Timeline */}
                <div className="space-y-6 mb-12">
                    {highlights.map((item, index) => (
                        <motion.div
                            key={item.year}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-bold text-gray-900">{item.year.slice(-2)}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {item.year}년 - {item.title}
                                    </h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <button
                        onClick={handleViewDetail}
                        className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        상세 이력 보기
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CareerSummarySection;
