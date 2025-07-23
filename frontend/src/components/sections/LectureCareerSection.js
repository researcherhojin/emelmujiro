import React from 'react';
import { motion } from 'framer-motion';

/**
 * LectureCareerSection
 * - 연도별 [~ing], [END] 상태의 강의 이력을 타임라인 형식으로 보여주는 섹션
 */
const LectureCareerSection = () => {
    /**
     * 연도(year)별 이력 데이터
     * - 날짜를 YY.MM.DD 형식으로 통일
     * - (4일 과정), (2주 과정) 등 추가 표현은 제거
     * - "강의 형태" 필드를 완전히 제외
     */
    const lectureData = [
        {
            year: 2025,
            lectureList: [
                {
                    status: '[~ing]',
                    title: '멋쟁이사자처럼 - 테킷 스타트업 스테이션 10기',
                    date: '24.12.13 ~ 25.03.25',
                    content: '예비 IT창업자 대상 개발 역량 강의',
                },
            ],
        },
        {
            year: 2024,
            lectureList: [
                {
                    status: '[END]',
                    title: '멋쟁이사자처럼&한국과학창의재단 - 찾아가는 학교 컨설팅',
                    date: '24.11.22',
                    content: '교사 업무 경감을 위한 생성형 AI 강의',
                },
                {
                    status: '[END]',
                    title: '멋쟁이사자처럼 - 심화_기업 연계형 실전 프로젝트 중심 AI과정_이미지처리(심화)',
                    date: '24.10.22 ~ 24.12.27',
                    content: '이미지 처리 이론 및 프로젝트 기반 Computer Vision 강의',
                },
                {
                    status: '[END]',
                    title: '멋쟁이사자처럼 - DSC공유대학XKT',
                    date: '24.10.17',
                    content: 'AI+X서비스사례분석',
                },
                {
                    status: '[END]',
                    title: '멋쟁이사자처럼 - 테킷 스타트업 스테이션 9기',
                    date: '24.07.05 ~ 24.10.15',
                    content: '예비 IT창업자 대상 개발 역량 강의',
                },
                {
                    status: '[END]',
                    title: '멋쟁이사자처럼 - 테킷 스타트업 스테이션 8기',
                    date: '24.03.08 ~ 24.06.14',
                    content: '예비 IT창업자 대상 개발 역량 강의',
                },
                {
                    status: '[~ing]',
                    title: '엘리스 - 삼성전자 Spotfire',
                    date: '23.05.10 ~ ~ing',
                    content: '삼성전자 임직원 대상 Spotfire 데이터 분석 및 시각화 강의',
                },
            ],
        },
        {
            year: 2023,
            lectureList: [
                {
                    status: '[END]',
                    title: '멋쟁이사자처럼 - 테킷 스타트업 스테이션 7기',
                    date: '23.11.13 ~ 24.02.07',
                    content: '예비 IT창업자 대상 개발 역량 강의',
                },
                {
                    status: '[END]',
                    title: 'Ablearn - 충남ICT 비전공자를 위한 Python 교육',
                    date: '23.10.27',
                    content: '충남ICT 비전공자를 대상으로 Python 교육',
                },
                {
                    status: '[END]',
                    title: '엘리스 - 삼성전자 Python 기초 교육',
                    date: '23.10.17 ~ 23.10.19',
                    content: '삼성전자 사원 대상 Python 기초 교육',
                },
                {
                    status: '[END]',
                    title: '엘리스 - 삼성전자 머신러닝 기초',
                    date: '23.08.31 ~ 23.09.06',
                    content: '머신러닝 기초, 회귀/분류/클러스터링',
                },
                {
                    status: '[END]',
                    title: '엘리스 - 현대건설 머신러닝 / 딥러닝 1, 3과정',
                    date: '23.05.16 ~ 23.09.18',
                    content: '현대건설 시니어 대상 ML/DL, YOLO',
                },
                {
                    status: '[END]',
                    title: '엘리스 - LG전자 Data Science 프로젝트',
                    date: '23.04.03 ~ 23.04.28',
                    content: 'Data Science 프로젝트 기획 ~ 개발 메인 강사',
                },
                {
                    status: '[END]',
                    title: '엘리스 - 제주더큰내일센터',
                    date: '23.04.07 ~ 23.05.12',
                    content: 'Python 백엔드 과정 강의',
                },
                {
                    status: '[END]',
                    title: '카카오 - SKT 컴퓨터비전 (with. OpenCV)',
                    date: '23.03.20 ~ 23.03.22',
                    content: 'Computer Vision with OpenCV',
                },
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - (밑바닥부터 탄탄한) 논문 기반 영상 처리 딥러닝 모델 설계',
                    date: '23.02.06 ~ 23.02.09',
                    content: 'CV 기초부터 논문 구현 & Flask',
                },
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - 성대, 인하대, 경기대 헬스케어 프로젝트',
                    date: '23.01.20 ~ 23.02.28',
                    content: '헬스케어 프로젝트 TA & 멘토링',
                },
            ],
        },
        {
            year: 2022,
            lectureList: [
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - 전북산학융합원 스마트 팩토리 데이터 머신러닝',
                    date: '22.11.22 ~ 22.11.25',
                    content: '스마트 팩토리 데이터 머신러닝',
                },
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - 인공지능 기본부터 자연어처리까지 - 파이썬 강의',
                    date: '22.11.16 ~ 22.11.21',
                    content: '파이썬 기초 ~ 클래스 전까지',
                },
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - 인공지능 기본부터 이미지처리까지 - DX 강의',
                    date: '22.11.14 ~ 22.11.15',
                    content: '디지털 트랜스포메이션',
                },
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - KETI Jetson TX2 Python 강의',
                    date: '22.11.07 ~ 22.11.08',
                    content: 'Jetson TX2 우분투 환경 Python 수업',
                },
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - KETI 나노 소재 빅데이터 활용 AI융합 전문가 과정',
                    date: '22.10.25 ~ 22.10.28',
                    content: '도메인 지식 + AI 이론 & 실습',
                },
                {
                    status: '[END]',
                    title: '한글과 컴퓨터 - NLP 실습 프로젝트',
                    date: '22.10.11 ~ 22.10.14',
                    content: 'Text Classification 이론 교육',
                },
                {
                    status: '[END]',
                    title: '모두의연구소 - 서울시립대 캠퍼스타운형 취업사관학교 (AI 과정)',
                    date: '22.08.16 ~ 22.08.26',
                    content: '서울시립대 재학생 대상 AI 과정',
                },
                {
                    status: '[END]',
                    title: '모두의연구소 - 서울대 사범대 파이썬 특강',
                    date: '22.08.08 ~ 22.08.09',
                    content: '서울대 재학생 대상 파이썬 교육',
                },
                {
                    status: '[END]',
                    title: 'Nepes - 2022 서울특별시 교육청 교원 직무연수 (AI 과정)',
                    date: '22.07.06 ~ 22.10.12',
                    content: '중등교원 대상 디지털 전환 AI 전문가 과정',
                },
                {
                    status: '[END]',
                    title: '모두의연구소 - LG전자 AI과정',
                    date: '22.04.04 ~ 22.04.18',
                    content: 'LG전자 임직원 대상 AI 교육',
                },
            ],
        },
    ];

    return (
        <section id="lecture-career" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-4">
                {/* 섹션 타이틀 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <h2 className="text-4xl font-bold mb-6 text-gray-900">
                        Lecture Career
                    </h2>
                    <p className="text-xl text-gray-600">강사 이력과 다양한 프로젝트성 교육 경험을 확인해보세요.</p>
                </motion.div>

                {/* 연도별 강의 타임라인 */}
                {lectureData.map((yearItem, yearIndex) => (
                    <motion.div
                        key={yearItem.year}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: yearIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        {/* 연도 헤더 */}
                        <h3 className="text-2xl font-semibold mb-4 text-gray-900">{yearItem.year}년</h3>
                        <div className="space-y-6 border-l border-gray-200 pl-6">
                            {yearItem.lectureList.map((lecture, idx) => (
                                <div key={`${lecture.title}-${idx}`} className="relative">
                                    {/* 좌측 연결선 Dot */}
                                    <span className="absolute -left-3 top-2 w-4 h-4 bg-gray-500 rounded-full" />
                                    {/* 강의 정보 */}
                                    <div className="pb-6">
                                        <div className="text-sm text-gray-500">
                                            <span className="font-medium text-gray-700 mr-2">{lecture.status}</span>
                                            {/* 날짜 출력 */}
                                            {lecture.date}
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-800 mt-2">{lecture.title}</h4>
                                        {/* 강의 형태 라인은 제거됨 */}
                                        <p className="text-gray-700 mt-2">{lecture.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default LectureCareerSection;
