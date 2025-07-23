import React from 'react';
import { PARTNER_COMPANIES } from '../../constants';

const LogosSection = () => {
  const partnerCompanies = PARTNER_COMPANIES;

  // 배열을 두 그룹으로 나누기
  const halfLength = Math.ceil(partnerCompanies.length / 2);
  const firstRow = partnerCompanies.slice(0, halfLength);
  const secondRow = partnerCompanies.slice(halfLength);
  
  // 무한 슬라이딩을 위해 각 줄을 두 번 복사
  const duplicatedFirstRow = [...firstRow, ...firstRow];
  const duplicatedSecondRow = [...secondRow, ...secondRow];

  return (
    <section id="partners" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">함께한 기업 및 기관</h2>
          <p className="text-lg text-gray-600">
            다양한 분야의 선도 기업들과 AI 프로젝트를 진행했습니다
          </p>
        </div>
      </div>

      {/* 무한 슬라이딩 컨테이너 */}
      <div className="relative space-y-8">
        {/* 첫 번째 줄 */}
        <div className="relative">
          <div className="flex animate-scroll hover:pause">
            {duplicatedFirstRow.map((company, index) => (
              <div
                key={`row1-${index}`}
                className="flex-shrink-0 px-8"
              >
                <div className="flex flex-col items-center justify-center w-32 h-32">
                  <img
                    src={company.logo}
                    alt={`${company.name} 로고 - ${company.description || 'AI 파트너 기업'}`}
                    className="h-16 w-auto object-contain mb-2 hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-sm text-gray-600 text-center whitespace-nowrap">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 두 번째 줄 - 반대 방향 애니메이션 */}
        <div className="relative">
          <div className="flex animate-scroll-reverse hover:pause">
            {duplicatedSecondRow.map((company, index) => (
              <div
                key={`row2-${index}`}
                className="flex-shrink-0 px-8"
              >
                <div className="flex flex-col items-center justify-center w-32 h-32">
                  <img
                    src={company.logo}
                    alt={`${company.name} 로고 - ${company.description || 'AI 파트너 기업'}`}
                    className="h-16 w-auto object-contain mb-2 hover:scale-110 transition-transform duration-300"
                  />
                  <span className="text-sm text-gray-600 text-center whitespace-nowrap">{company.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogosSection;
