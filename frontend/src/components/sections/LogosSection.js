import React from 'react';

const LogosSection = () => {

    const partnerCompanies = [
        // 대기업
        '삼성전자', 'LG', '현대자동차', 'SK', 'KT', '네이버', '카카오', '한글과컴퓨터',
        // 교육기관
        '서울대학교', '서울시립대', '멋쟁이사자처럼', '엘리스', '서울시교육청',
        // 공공기관 및 기타
        '한국과학창의재단', '나노융합산업연구조합', '모두의연구소'
    ];

    return (
        <section id="partners" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                        함께한 기업 및 기관
                    </h2>
                    <p className="text-lg text-gray-600">
                        다양한 분야의 선도 기업들과 AI 프로젝트를 진행했습니다
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {partnerCompanies.map((company, index) => (
                        <div key={index} className="text-center">
                            <span className="text-gray-700 font-medium">{company}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LogosSection;
