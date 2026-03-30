# Next Session TODO

## 1. CI 통과 확인 & 프로덕션 배포

- [x] CI 통과 확인 (커밋 0dc1b7c) — 이후 커밋 정상 진행
- [ ] Docker 프로덕션 재배포 필요 여부 확인 (auto-deploy webhook 또는 수동)
- [ ] 블로그 포스트 프로덕션 DB 반영 (Docker DB에 Post 7 콘텐츠 투입)
- [x] emelmujiro.com에서 변경사항 검증 — 홈페이지, 네비게이션, 블로그 slug, 이메일 모두 반영
- [ ] 홈페이지 스크린샷 업데이트 (docs/screenshots/) — 히어로 리디자인 이후 미반영

## 2. 프로필 → 강의이력 페이지 전환 — 완료

- [x] 강의 이력 데이터 구조 설계 및 입력 (37건, 2022~2026)
- [x] 2026 예정 이력 반영 (KEITI 확정, 국회도서관·국토안전관리원 예정, 멋사 Python 부트캠프 4/3 이후 공개, UST 취소)
- [x] 4탭 구조 → 강의이력 단일 페이지 전환 (CareerTab, EducationTab, ProjectsTab, TimelineSection, ProfileHero, StatsSection 모두 삭제)
- [x] 네비게이션 라벨: "프로필" → "강의이력", 풋터: "대표 프로필" → "강의이력"
- [x] 네비게이션 순서: 강의이력 → 인사이트
- [x] SEO 메타 업데이트: "대표 프로필 - 이호진" → "강의이력 - 에멜무지로"
- [x] 기관명 → 클라이언트 전환 (엘리스 → 삼성전자 등)
- [x] visibleAfter 날짜 기반 표시 제어 구현
- [ ] 필터 UI (연도별, 기관유형별) — 미구현, 현재 연도 그룹핑으로 충분

## 3. 홈페이지 리디자인 — 완료

- [x] 히어로: 중앙 정렬, 라이트/다크 분리, "AI 교육 · 컨설팅 · 개발 / 원스톱 AI 파트너"
- [x] CTA: "프로젝트 문의하기" → "무료 상담 신청"
- [x] 서비스 카드 클릭 → ServiceModal 연결
- [x] 서비스 details: 전문 분야 뱃지와 1:1 매핑 (생성형 AI, Python 자동화, LLM, RAG, 바이브코딩, 멘토링)
- [x] 수강생 후기: 3행 → 2행 (기업 교육 + 고용노동부), 5x copies 스크롤 (40s)
- [x] 통계: 누적 교육생 → 누적 교육 시간(5,000+), 협력사 기업 제거

## 4. 블로그 리펙토링 — 완료

- [x] 리더보드 분석 글: 아키텍처 다이어그램 8장 + 비교표 + 선택 가이드 추가 → 비공개 처리 (실전 선택 가이드와 중복)
- [x] TurboQuant 글: Google Research 공식 이미지 4장 + 비교표 + 파이프라인 표 추가
- [x] 썸네일 업데이트 (리더보드 → GLM-5, TurboQuant → PolarQuant GIF)

## 5. 남은 작업

- [ ] 홈페이지 스크린샷 업데이트 (docs/screenshots/)
- [ ] Docker 프로덕션 재배포
- [ ] contact@emelmujiro.com 실제 수신 설정 확인 (DNS MX, 메일 포워딩)
- [ ] 블로그 URL `/blog` → `/insights` 전환 (라우터, sitemap, prerender, 리다이렉트)
- [ ] 블로그 추가 포스트 기획 (필요 시)
