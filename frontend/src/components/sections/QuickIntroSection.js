import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STATISTICS } from '../../constants';

const QuickIntroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-8">
                        실무 경험을 바탕으로한 <br/>
                        체계적인 AI 교육과 컨설팅
                    </h2>
                    
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        2022년부터 축적한 AI 교육 노하우와 실무 프로젝트 경험을 바탕으로,<br/>
                        각 기업의 특성에 맞는 맞춤형 AI 솔루션을 제공합니다.
                    </p>

                    <div className="grid grid-cols-3 gap-8 mb-12">
                        <div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{STATISTICS.education.totalStudentsText}</div>
                            <div className="text-sm text-gray-600">누적 교육 수료생</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{STATISTICS.projects.totalProjectsText}</div>
                            <div className="text-sm text-gray-600">완료된 프로젝트</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">{STATISTICS.experience.totalCompaniesWorkedWith}+</div>
                            <div className="text-sm text-gray-600">협력 기업</div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/about')}
                        className="inline-flex items-center text-gray-900 font-medium hover:text-gray-600 transition-colors group"
                    >
                        자세히 알아보기
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            
            </div>
        </section>
    );
};

export default QuickIntroSection;