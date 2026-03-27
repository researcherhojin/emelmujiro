# Next Session TODO

## 1. CI 통과 확인 & 프로덕션 배포

- [ ] CI 통과 확인 (커밋 0dc1b7c)
- [ ] Docker 프로덕션 재배포 필요 여부 확인 (auto-deploy webhook 또는 수동)
- [ ] 블로그 포스트 프로덕션 DB 반영 (Docker DB에 Post 7 콘텐츠 투입)
- [ ] emelmujiro.com에서 변경사항 검증:
  - 홈페이지: Logos → Services → Testimonials → CTA 흐름
  - 네비게이션: "소개" 제거, "블로그" → "인사이트"
  - 블로그: slug 기반 URL (/blog/{slug})
  - 프로필: 연혁 탭 추가, 수강후기 제거
  - 이메일: contact@emelmujiro.com 반영
- [ ] 홈페이지 스크린샷 업데이트 (docs/screenshots/)

## 2. Profile Page Redesign

오늘 논의한 방향:

- 현재 문제: 이력서 구조(경력/학력/프로젝트/연혁 탭)로 되어 있어 B2B 클라이언트에게 맞지 않음
- 목표: "이 사람에게 교육/컨설팅을 맡겨도 되는가?"에 답하는 페이지
- 필요한 정보: (1) 누구인지 (2) 뭘 해왔는지 (3) 믿을 수 있는지

작업 항목:

- [ ] 4개 탭(경력/학력/프로젝트/연혁) 목적에 맞게 재구성 또는 탭 구조 자체 재설계
- [ ] 강의 이력 데이터 통합 (2022~2026, 30+ 건 — 노션에서 공유받은 데이터)
- [ ] 2026 예정 이력 반영 (UST, 한국환경산업기술원, 국회도서관, 국토안전관리원)
- [ ] 경력 설명 검증 — 데이원컴퍼니 프로필 이미지와 매칭

## 3. Blog Refinement

- [ ] Post 7 (오픈소스 LLM 가이드) 썸네일 개선 — 현재 Qwen 아키텍처 다이어그램 사용 중
- [ ] 추가 블로그 포스트 기획 (필요 시)

## 4. Contact Email Setup

- [ ] contact@emelmujiro.com 이메일 실제 수신 설정 확인 (DNS MX, 메일 포워딩 등)

## 5. Cleanup (Low Priority)

- [ ] AboutPage.tsx — 파일 유지 중 (라우팅만 제거). 필요 없으면 삭제
- [ ] 미사용 i18n 키 정리 (about.values._, about.cta._ 등)
- [ ] TimelineSection.tsx — 프로필 연혁 탭에서만 사용 중. 프로필 재설계 시 같이 정리
