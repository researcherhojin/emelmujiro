# Next Session TODO

## 1. 콘텐츠

- [ ] 추가 블로그 포스트 기획: AI Agent 실전 구축 가이드, RAG 파이프라인 설계 등 서비스 영역과 연결되는 기술 콘텐츠
- [ ] 기존 포스트 한국어/영어 버전 정합성 확인
- [ ] 블로그 포스트 프로덕션 DB 반영 (Docker DB에 리펙토링된 Post 2, 7 콘텐츠 투입)

## 2. 프로덕션

- [ ] emelmujiro.com 최종 검증 (히어로, 강의이력, 인사이트 URL, 서비스 모달)
- [ ] 홈페이지 스크린샷이 실제 프로덕션과 일치하는지 확인 (로컬 빌드 vs 프로덕션)

## 3. 기능 개선

- [ ] 강의이력 필터 UI (연도별, 기관유형별) — 현재 연도 그룹핑으로 충분하지만 건수 증가 시 필요
- [ ] 멘토링/활동 이력 추가 여부 검토 (ICT 피우다, 해커톤 멘토, 오픈소스 컨트리뷰션 등)
- [ ] 풋터 "서비스" 섹션의 footerServices i18n 키가 services 키와 별도 관리 — 통합 검토

## 4. 기술 부채

- [ ] TypeScript 기존 에러 4건 수정 (BlogCard excerpt, BlogDetail excerpt, NotificationContext null, setupTests scrollMargin)
- [ ] `common.about` i18n 키 — 컴포넌트에서 미사용이지만 i18n JSON에 남아있음. 삭제 검토
- [ ] profileData.ts 테스트 — 삭제된 함수 테스트가 getTeachingHistory만 테스트하도록 축소됨. 커버리지 확인
