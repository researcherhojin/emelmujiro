# Next Session TODO

## 1. Profile Page Redesign

- [ ] 프로필 페이지 전체 재설계 — 이력서 구조에서 B2B 신뢰 구축 구조로 전환
- [ ] 현재 4개 탭(경력/학력/프로젝트/연혁) 목적에 맞게 재구성
- [ ] 강의 이력 데이터 통합 (2022~2026, 30+ 건)
- [ ] 2026 예정 이력 반영 (UST, 한국환경산업기술원, 국회도서관, 국토안전관리원)
- [ ] 경력 설명 검증 — 데이원컴퍼니 프로필 이미지와 매칭

## 2. Production Deploy & Verification

- [ ] emelmujiro.com에서 변경사항 검증:
  - 홈페이지: Logos → Services → Testimonials → CTA 흐름
  - 네비게이션: "소개" 제거, "블로그" → "인사이트"
  - 블로그: slug 기반 URL (/blog/{slug})
  - 프로필: 연혁 탭 추가, 수강후기 제거
  - 이메일: contact@emelmujiro.com 반영
- [ ] 홈페이지 스크린샷 업데이트 (docs/screenshots/)

## 3. Blog Refinement

- [ ] Post 7 (오픈소스 LLM 가이드) 썸네일 개선
- [ ] 추가 블로그 포스트 기획 (필요 시)

## 4. Contact Email Setup

- [ ] contact@emelmujiro.com 이메일 실제 수신 설정 확인 (DNS MX, 메일 포워딩 등)

## 5. Cleanup (Low Priority)

- [ ] AboutPage.tsx — 파일 유지 중 (라우팅만 제거). 필요 없으면 삭제
- [ ] 미사용 i18n 키 정리 (about.values._, about.cta._ 등)
