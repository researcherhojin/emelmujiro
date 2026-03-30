# Next Session TODO

## 1. CI 통과 확인 & 프로덕션 배포

- [x] CI 통과 확인 (커밋 0dc1b7c) — 이후 커밋 4건 정상 진행
- [ ] Docker 프로덕션 재배포 필요 여부 확인 (auto-deploy webhook 또는 수동)
- [ ] 블로그 포스트 프로덕션 DB 반영 (Docker DB에 Post 7 콘텐츠 투입)
- [x] emelmujiro.com에서 변경사항 검증:
  - [x] 홈페이지: Logos → Services → Testimonials → CTA 흐름
  - [x] 네비게이션: "소개" 제거, "블로그" → "인사이트"
  - [x] 블로그: slug 기반 URL (/blog/{slug})
  - [x] 프로필: 연혁 탭 추가
  - [x] 이메일: contact@emelmujiro.com 반영
- [ ] 홈페이지 스크린샷 업데이트 (docs/screenshots/) — 3/27 촬영, Testimonials 추가(3/28) 이후 미반영

## 2. 프로필 → 강의이력 페이지 전환

기존 프로필(이력서 구조)을 강의이력 중심 페이지로 전환. B2B 클라이언트가 "이 사람에게 교육/컨설팅을 맡겨도 되는가?"에 바로 답할 수 있도록.

구조 방향:

- Hero 영역에 핵심 경력 한 줄 요약 (현재 ProfileHero 활용)
- 본문: 강의이력 리스트 (30+ 건, 2022~2026)
- 필터/정렬: 연도별, 기관유형별 (현재 ProjectsTab 카테고리 필터 구조 재활용)
- 네비게이션 라벨: "프로필" → "강의이력"
- 경력/학력 탭 제거 (Hero에 요약으로 대체), 프로젝트/연혁 탭도 제거

작업 항목:

- [ ] 강의 이력 데이터 구조 설계 및 입력 (노션에서 공유받은 2022~2026 데이터, 30+ 건)
- [x] 2026 예정 이력 반영 (한국환경산업기술원, 국회도서관, 국토안전관리원 — UST 취소)
- [ ] 4탭 구조 → 강의이력 단일 페이지로 전환 (CareerTab, EducationTab, ProjectsTab, TimelineSection 제거/통합)
- [ ] 필터 UI 구현 (연도별, 기관유형별 — ProjectsTab 필터 패턴 재활용)
- [x] 네비게이션 라벨 변경: "프로필" → "강의이력" (i18n ko/en)
- [ ] ProfileHero 간소화 — 핵심 경력 한 줄 요약으로
- [ ] SEO 메타/구조화 데이터 업데이트 (title, description, breadcrumb)

## 3. Blog Refinement

- [ ] Post 7 (오픈소스 LLM 가이드) 썸네일 개선 — 현재 Qwen 아키텍처 다이어그램 사용 중
- [ ] 추가 블로그 포스트 기획 (필요 시)

## 4. Contact Email Setup

- [ ] contact@emelmujiro.com 이메일 실제 수신 설정 확인 (DNS MX, 메일 포워딩 등)

## 5. Cleanup

- [x] AboutPage.tsx 삭제 — 파일, App.tsx lazy import, 테스트 주석 모두 제거 완료
- [x] 미사용 i18n 키 정리 (about.values._, about.cta._ 등) — 이미 정리됨
- [ ] TimelineSection.tsx — 강의이력 전환 시 같이 정리
