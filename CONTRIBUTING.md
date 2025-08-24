# 🤝 Contributing to Emelmujiro

우선 Emelmujiro 프로젝트에 기여하고자 하는 관심에 감사드립니다!

## 📋 기여 방법

### 1. 이슈 생성

- 버그를 발견하거나 새로운 기능을 제안하고 싶다면 먼저 [이슈](https://github.com/researcherhojin/emelmujiro/issues)를 확인해주세요
- 동일한 이슈가 없다면 새로운 이슈를 생성해주세요

### 2. Fork & Clone

```bash
# Fork 후 클론
git clone https://github.com/[your-username]/emelmujiro.git
cd emelmujiro

# Upstream 추가
git remote add upstream https://github.com/researcherhojin/emelmujiro.git
```

### 3. 브랜치 생성

```bash
# 기능 개발
git checkout -b feature/your-feature-name

# 버그 수정
git checkout -b fix/bug-description
```

### 4. 개발 환경 설정

```bash
# Frontend 의존성 설치
cd frontend
npm install

# Backend 의존성 설치
cd ../backend
pip install -r requirements.txt
```

### 5. 코드 작성

- TypeScript를 사용해주세요 (Frontend)
- ESLint와 Prettier 규칙을 준수해주세요
- 테스트를 작성해주세요
- 커밋 메시지는 다음 형식을 따라주세요:
  - `feat:` 새로운 기능
  - `fix:` 버그 수정
  - `docs:` 문서 수정
  - `style:` 코드 포맷팅
  - `refactor:` 코드 리팩토링
  - `test:` 테스트 추가/수정
  - `chore:` 빌드 과정 또는 보조 도구 수정

### 6. 테스트

```bash
# Frontend 테스트
npm test

# Lint 검사
npm run lint

# TypeScript 타입 체크
npm run type-check
```

### 7. Pull Request

- main 브랜치로 PR을 생성해주세요
- PR 템플릿을 작성해주세요
- 모든 CI 체크가 통과하는지 확인해주세요

## 🎨 코드 스타일

### TypeScript/JavaScript

- 함수형 컴포넌트 사용 (React)
- Props에 TypeScript 인터페이스 정의
- async/await 사용 권장
- 100% TypeScript 사용 (any 타입 최소화)

### CSS

- Tailwind CSS 유틸리티 클래스 우선 사용
- 커스텀 CSS는 최소화

## 🛠 개발 가이드

### 컴포넌트 개발

```tsx
// LazyImage 컴포넌트 사용 예시
<LazyImage
  src="/image.jpg"
  webpSrc="/image.webp"
  srcSet="/image-320w.jpg 320w, /image-640w.jpg 640w"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={true} // Above-the-fold 이미지용
  alt="Description"
/>
```

### 테스트 작성

- 모든 새로운 컴포넌트는 테스트 파일 필수
- `renderWithProviders` 유틸리티 사용
- 테스트 커버리지 80% 이상 유지

```tsx
import { renderWithProviders } from '@/test-utils';

test('component renders correctly', () => {
  const { getByText } = renderWithProviders(<Component />);
  expect(getByText('Expected Text')).toBeInTheDocument();
});
```

### 성능 최적화

- 이미지: LazyImage 컴포넌트 사용
- 컴포넌트: React.lazy로 코드 스플리팅
- 메모이제이션: useMemo, useCallback 적절히 활용

### 개발 스크립트

```bash
npm run dev              # 개발 서버
npm run validate         # 전체 검증 (lint + type-check + test)
npm run analyze          # 번들 분석
npm run test:coverage    # 테스트 커버리지
```

## 📦 의존성 관리

### 업데이트 정책

1. **Patch 업데이트**: 즉시 적용
2. **Minor 업데이트**: 테스트 후 적용 (1주 이내)
3. **Major 업데이트**: 별도 브랜치에서 테스트 (2주 검토)

### 현재 주요 의존성

- React: 18.3.x (19.x 마이그레이션 예정)
- TypeScript: 5.9.x
- Tailwind CSS: 3.3.x
- Framer Motion: 11.x

### 의존성 업데이트 프로세스

```bash
# 1. 업데이트 가능한 패키지 확인
npm outdated

# 2. 안전한 업데이트 (patch/minor)
npm update

# 3. Major 업데이트 (주의 필요)
npm install package@latest

# 4. 테스트 실행
npm test
npm run type-check
npm run build
```

### 보안 취약점 관리

```bash
# 취약점 확인
npm audit

# 자동 수정 시도 (주의: breaking changes 가능)
npm audit fix

# 상세 리포트
npm audit --json
```

현재 알려진 이슈:

- react-scripts 내부 의존성 취약점 9개 (Vite 마이그레이션으로 해결 예정)

## 📝 문서화

- 복잡한 로직에는 주석 추가
- README 업데이트 필요시 함께 수정
- API 변경사항은 문서화

## ❓ 질문이 있으신가요?

- [GitHub Issues](https://github.com/researcherhojin/emelmujiro/issues)에 질문을 남겨주세요
- 이메일: researcherhojin@gmail.com

감사합니다! 🙏
