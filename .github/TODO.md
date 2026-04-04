# Next Session TODO

## 1. 콘텐츠

- [ ] 블로그 포스트 기획 — AI Agent 실전 구축 가이드, RAG 파이프라인 설계 등 서비스 영역(교육·컨설팅·개발)과 직접 연결되는 기술 콘텐츠 시리즈

## 2. 기능 개선

- [ ] 강의이력 필터 UI — 연도별·기관유형별 필터 (현재 38건, upcoming 2건 포함). 40건 초과 시 UX 저하 예상
- [ ] 멘토링/활동 이력 추가 검토 — ICT 피우다 멘토, 해커톤 심사위원, 오픈소스 컨트리뷰션 등 교육 외 활동을 별도 섹션 또는 기존 이력에 통합

## 3. SEO

- [ ] Google Search Console 재색인 요청 — canonical URL 버그 수정 배포 완료. `/en/profile`, `/en/privacy` 등 미색인 페이지에 대해 GSC에서 수동 재색인 요청 필요
- [ ] GSC redirect 오류 (4건) + 404 (1건, `/about` 삭제) — Google 재크롤 후 자동 해소 예상. 모니터링

## 4. CI/자동화

- [ ] GitHub Pages actions Node.js deprecation — `upload-pages-artifact@v4`, `deploy-pages@v5` 등이 Node.js 20 타깃. 최신 버전 대기 중 (제어 불가, 모니터링)

## 5. 하우스키핑

- [ ] README 테스트 수 업데이트 — 프론트엔드 1172→1180 (개인정보처리방침 테스트 8건 추가). `make update-test-counts` 실행 후 커밋
- [ ] 개인정보처리방침 법률 검토 — 개인정보 보호법 제30조 기준 13개 섹션 작성 완료. 법률 전문가 최종 검토 후 보완 필요 시 i18n JSON 수정
