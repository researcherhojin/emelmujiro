# 의존성 업데이트 계획 (2025.08.10)

## 📊 현재 의존성 상태 분석

### 🔴 Major 업데이트 필요 (주의 필요)

1. **React 18.3.1 → 19.1.1**
   - Breaking changes 존재
   - 테스트 및 호환성 검증 필요
   - 예상 작업량: 2-3일

2. **Framer Motion 11.18.2 → 12.23.12**
   - 애니메이션 API 변경
   - 기존 애니메이션 코드 수정 필요
   - 예상 작업량: 1-2일

3. **React Markdown 9.1.0 → 10.1.0**
   - 마크다운 파싱 로직 변경
   - 블로그 컴포넌트 테스트 필수
   - 예상 작업량: 1일

4. **Tailwind CSS 3.4.17 → 4.1.11**
   - 설정 파일 마이그레이션 필요
   - 클래스명 변경 가능성
   - 예상 작업량: 2일

5. **Web Vitals 2.1.4 → 5.1.0**
   - API 대폭 변경
   - 성능 모니터링 코드 재작성
   - 예상 작업량: 1일

### 🟡 Minor 업데이트 (안전)

1. **@eslint/js 9.32.0 → 9.33.0**
2. **eslint 9.32.0 → 9.33.0**
3. **concurrently 8.2.2 → 9.2.0**

### 🟢 Patch 업데이트 (즉시 적용 가능)

- **@types/react-helmet-async 1.0.3 → 1.0.1** (다운그레이드 권장)

## 📅 단계별 업데이트 계획

### Phase 1: 즉시 적용 (1일)

- [ ] ESLint 및 관련 패키지 업데이트
- [ ] @types/react-helmet-async 다운그레이드
- [ ] 테스트 실행 및 검증

### Phase 2: 마이너 업데이트 (2-3일)

- [ ] Web Vitals 5.1.0 업데이트
  - 모니터링 코드 마이그레이션
  - 새로운 메트릭 추가
- [ ] concurrently 9.2.0 업데이트
  - 스크립트 호환성 테스트

### Phase 3: 메이저 업데이트 준비 (1주)

- [ ] React 19 마이그레이션 가이드 검토
- [ ] 테스트 환경 구축
- [ ] 브랜치 생성 및 점진적 마이그레이션

### Phase 4: 메이저 업데이트 실행 (2주)

1. **React 19 마이그레이션**
   - [ ] React 및 React DOM 업데이트
   - [ ] 타입 정의 업데이트
   - [ ] 컴포넌트 호환성 테스트
   - [ ] 성능 벤치마크

2. **Framer Motion 12 마이그레이션**
   - [ ] 애니메이션 API 변경사항 적용
   - [ ] 성능 최적화

3. **Tailwind CSS 4 마이그레이션**
   - [ ] 설정 파일 마이그레이션
   - [ ] 유틸리티 클래스 업데이트
   - [ ] 커스텀 컴포넌트 스타일 검증

## 🛡️ 리스크 관리

### 테스트 전략

1. **단위 테스트**: 모든 업데이트 후 실행
2. **E2E 테스트**: 메이저 업데이트 후 실행
3. **시각적 회귀 테스트**: UI 라이브러리 업데이트 후
4. **성능 테스트**: React 및 Web Vitals 업데이트 후

### 롤백 계획

- Git 브랜치 전략 활용
- 각 Phase별 태그 생성
- package-lock.json 백업

## 📝 업데이트 명령어

```bash
# Phase 1 - 안전한 업데이트
npm update @eslint/js eslint
npm install @types/react-helmet-async@1.0.1

# Phase 2 - Web Vitals
npm install web-vitals@5.1.0
npm install concurrently@9.2.0

# Phase 3 - 테스트 환경 (별도 브랜치)
git checkout -b feature/react-19-migration
npm install react@19 react-dom@19
npm install --save-dev @types/react@19 @types/react-dom@19

# Phase 4 - 기타 메이저 업데이트
npm install framer-motion@12
npm install react-markdown@10
npm install -D tailwindcss@4
```

## ✅ 체크리스트

### 업데이트 전

- [ ] 현재 버전 package-lock.json 백업
- [ ] 모든 테스트 통과 확인
- [ ] 브랜치 생성

### 업데이트 중

- [ ] 각 패키지별 마이그레이션 가이드 확인
- [ ] Breaking changes 문서화
- [ ] 코드 수정 및 테스트

### 업데이트 후

- [ ] 전체 테스트 스위트 실행
- [ ] 번들 사이즈 비교
- [ ] 성능 메트릭 측정
- [ ] 배포 환경 테스트

## 🎯 우선순위 매트릭스

| 패키지        | 긴급도 | 영향도 | 난이도 | 우선순위 |
| ------------- | ------ | ------ | ------ | -------- |
| Web Vitals    | 높음   | 높음   | 중간   | 1        |
| ESLint        | 중간   | 낮음   | 낮음   | 2        |
| React 19      | 낮음   | 높음   | 높음   | 3        |
| Framer Motion | 낮음   | 중간   | 중간   | 4        |
| Tailwind CSS  | 낮음   | 높음   | 높음   | 5        |

## 📞 지원 리소스

- [React 19 Migration Guide](https://react.dev/blog)
- [Framer Motion Upgrade Guide](https://www.framer.com/motion/upgrade-guide/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Web Vitals Migration](https://github.com/GoogleChrome/web-vitals)

---

**마지막 업데이트**: 2025.08.10
**다음 검토 예정일**: 2025.09.01
