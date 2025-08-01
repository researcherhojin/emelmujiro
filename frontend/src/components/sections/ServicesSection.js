import React from 'react';

const ServicesSection = () => {

    const services = [
        {
            title: 'AI 컨설팅',
            description: '비즈니스 문제에 대한 실용적 AI 솔루션',
            details: '모델 개발, MLOps 구축, 성능 최적화'
        },
        {
            title: '기업 AI 교육',
            description: '실무자를 위한 체계적인 AI 역량 강화',
            details: '맞춤형 커리큘럼, 핸즈온 실습, 1:1 멘토링'
        },
        {
            title: 'LLM 솔루션',
            description: '최신 언어 모델 기반 비즈니스 혁신',
            details: '챗봇 개발, RAG 시스템, 문서 분석'
        }
    ];


    return (
        <section id="services" className="py-32 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-20 text-center">
                    <div className="inline-block mb-6">
                        <span className="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-4 block">
                            What We Do
                        </span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-6 relative leading-tight">
                            주요 서비스
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-gray-900 rounded-full"></div>
                        </h2>
                    </div>
                    <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
                        기업의 AI 도입을 위한 단계별 솔루션
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-gray-900 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
                            <div className="mb-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-900 transition-all duration-300">
                                    <div className="w-6 h-6 bg-gray-900 rounded group-hover:bg-white transition-all duration-300"></div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-black transition-colors">
                                    {service.title}
                                </h3>
                                <div className="h-1 w-12 bg-gray-200 rounded-full group-hover:w-24 group-hover:bg-gray-900 transition-all duration-500"></div>
                            </div>
                            
                            <p className="text-lg text-gray-700 mb-6 leading-relaxed group-hover:text-gray-800 transition-colors">
                                {service.description}
                            </p>
                            
                            <p className="text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                                {service.details}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default ServicesSection;
