import React from 'react';
import { motion } from 'framer-motion';
import SEOHelmet from '../common/SEOHelmet';
import { ArrowRight, CheckCircle } from 'lucide-react';

const AboutPage = () => {

    const timeline = [
        { year: '2022', title: 'AI 교육 시작', description: '국내 주요 기업 대상 AI/ML 교육 프로그램 운영' },
        { year: '2023', title: '교육 프로그램 확대', description: '삼성전자, SK, LG 등 대기업 교육 프로젝트 진행' },
        { year: '2024', title: '에멜무지로 설립', description: 'AI 교육 및 컨설팅 전문 기업으로 법인 설립' },
        { year: '2025', title: '사업 영역 확장', description: 'LLM 기반 솔루션 및 AI 자동화 서비스 준비' }
    ];

    const companyValues = [
        {
            title: '실무 중심',
            description: '이론보다 실제 비즈니스 문제 해결에 집중합니다',
            points: ['50+ 프로젝트 성공 사례', '즉시 적용 가능한 솔루션', 'ROI 기반 접근']
        },
        {
            title: '맞춤형 접근',
            description: '각 기업의 특성과 필요에 맞는 최적화된 솔루션',
            points: ['사전 컨설팅 무료 제공', '단계별 접근 방법', '지속적 협업 체계']
        },
        {
            title: '기술 전문성',
            description: '최신 AI/ML 기술에 대한 깊은 이해와 경험',
            points: ['PyTorch/TensorFlow 전문', 'LLM/GPT 활용 경험', '연구 개발 백그라운드']
        }
    ];

    const services = [
        {
            title: 'AI/ML 컨설팅',
            description: '비즈니스 문제에 대한 실용적 AI 솔루션',
            features: ['맞춤형 모델 개발', 'MLOps 구축 지원', '성능 최적화']
        },
        {
            title: '기업 교육',
            description: '실무자를 위한 체계적인 AI 역량 강화',
            features: ['대기업 맞춤 커리큘럼', '핸즈온 실습 중심', '전문가 1:1 멘토링']
        },
        {
            title: 'R&D 협력',
            description: '기술 혁신을 위한 공동 연구 개발',
            features: ['공동 연구 프로젝트', '기술 검증 서비스', 'POC 개발 지원']
        }
    ];

    const partnerCompanies = [
        '삼성전자', 'SK', 'LG', '한국전력공사', '국민은행', 
        'CJ', '현대자동차', '포스코', 'KT', '네이버'
    ];

    return (
        <div className="min-h-screen bg-white">
            <SEOHelmet 
                title="회사소개"
                description="에멜무지로는 AI 기술의 대중화를 선도하는 전문 컨설팅 기업입니다."
                keywords="에멜무지로, AI 컨설팅, 기업 AI 교육, 머신러닝 컨설팅"
                url="https://emelmujiro.com/about"
            />
            
            {/* Hero Section */}
            <section className="pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                에멜무지로
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                2022년부터 시작한 AI 교육 경험을 바탕으로 2024년 설립된 
                                AI 전문 컨설팅 기업입니다.<br/>
                                국내 주요 기업들과 함께 
                                실무 중심의 AI 솔루션을 만들어가고 있습니다.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Company Overview */}
            <section className="py-20 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-16">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                비전
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed mb-8">
                                모든 기업이 AI 기술을 통해 비즈니스 혁신을 이룰 수 있도록 
                                실무 중심의 체계적인 솔루션을 제공합니다.
                            </p>
                            
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                미션
                            </h2>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start">
                                    <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    대기업부터 스타트업까지 맞춤형 AI 컨설팅 제공
                                </li>
                                <li className="flex items-start">
                                    <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    실무자 중심의 체계적인 AI 교육 프로그램 운영
                                </li>
                                <li className="flex items-start">
                                    <span className="block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    기업과의 공동 R&D를 통한 혁신적인 기술 개발
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <div className="bg-gray-50 rounded-xl p-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">회사 현황</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-3xl font-bold text-black">1,000+</div>
                                        <div className="text-sm text-gray-600">누적 교육 수료생</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">50+</div>
                                        <div className="text-sm text-gray-600">완료된 프로젝트</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-black">15+</div>
                                        <div className="text-sm text-gray-600">협력 기업</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-12">연혁</h2>
                    
                    <div className="space-y-8">
                        {timeline.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex gap-8 items-start"
                            >
                                <div className="flex-shrink-0">
                                    <div className="text-2xl font-bold text-gray-900">{item.year}</div>
                                </div>
                                <div className="flex-grow pb-8 border-b border-gray-200 last:border-0">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-12">핵심 가치</h2>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {companyValues.map((value, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                                <p className="text-gray-600 mb-6">{value.description}</p>
                                
                                <ul className="space-y-3">
                                    {value.points.map((point, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-12">주요 서비스</h2>
                    
                    <div className="grid lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl p-8 hover:border-gray-300 transition-colors">
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                                <p className="text-gray-600 mb-6">{service.description}</p>
                                
                                <ul className="space-y-2">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-gray-600">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-3"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partner Companies */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-12">파트너사</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                        {partnerCompanies.map((company, index) => (
                            <div key={index} className="text-center">
                                <div className="text-gray-600 font-medium">{company}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-black text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        프로젝트를 시작하세요
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        AI 전문가와 함께 귀사의 비즈니스 문제를 해결하세요
                    </p>
                    <button
                        onClick={() => window.location.href = '/contact'}
                        className="inline-flex items-center px-8 py-4 bg-white text-black 
                            font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        무료 상담 신청하기
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;