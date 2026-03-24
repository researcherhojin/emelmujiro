# Contributing to Emelmujiro

Emelmujiro 프로젝트에 기여하고자 하는 관심에 감사드립니다!

## 기여 방법

### 1. 이슈 생성

- 버그를 발견하거나 새로운 기능을 제안하고 싶다면 먼저 [이슈](https://github.com/researcherhojin/emelmujiro/issues)를 확인해주세요
- 동일한 이슈가 없다면 새로운 이슈를 생성해주세요

### 2. Fork & Clone

```bash
git clone https://github.com/[your-username]/emelmujiro.git
cd emelmujiro
git remote add upstream https://github.com/researcherhojin/emelmujiro.git
```

### 3. 브랜치 생성

```bash
git checkout -b feature/your-feature-name   # 기능 개발
git checkout -b fix/bug-description         # 버그 수정
```

### 4. 개발 환경 설정

**필수 조건**: Node >= 24, Python 3.12, [uv](https://docs.astral.sh/uv/)

```bash
# 전체 설치 (루트에서 실행)
make install               # npm install + uv sync --extra dev

# Backend 초기 설정
cd backend && uv run python manage.py migrate && cd ..
```

### 5. 개발 서버 실행

```bash
npm run dev              # Frontend(5173) + Backend(8000) 동시 실행
npm run dev:clean        # 포트 정리 후 실행
```

### 6. 코드 작성 규칙

- **TypeScript** 100% 사용 (`any` 최소화)
- **함수형 컴포넌트** + hooks 패턴
- **Tailwind CSS** 유틸리티 클래스 우선 사용
- **i18n**: 모든 UI 문자열은 `useTranslation()` 사용 (하드코딩 금지)
- **ESLint + Prettier** 규칙 준수 (pre-commit 훅이 자동 실행)
- **상태 관리**: React Context 사용 (`src/contexts/` — UIContext, AuthContext, BlogContext, NotificationContext)

### 7. 커밋 메시지

[Conventional Commits](https://www.conventionalcommits.org/) 형식을 따라주세요. PR 체크에서 검증됩니다.

```
feat(frontend): add dark mode toggle
fix(api): handle 401 token refresh
docs(readme): update tech stack section
test(blog): add BlogCard snapshot tests
refactor(auth): simplify token refresh logic
chore(deps): bump vite to 8.0
deps(frontend): upgrade react-router to 7.x
ci(pr-checks): add SEO file validation
```

허용 타입: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `ci`

### 8. 테스트

```bash
# Frontend 테스트 (from frontend/)
npm run test:run         # 단일 실행
npm test                 # Watch 모드
npm run test:coverage    # 커버리지 리포트

# 특정 테스트 파일 실행
CI=true npm test -- --run src/components/common/__tests__/Navbar.test.tsx

# 전체 검증 (lint + type-check + test)
npm run validate

# E2E 테스트
npm run test:e2e

# Backend 테스트 (from backend/)
DATABASE_URL="" uv run python manage.py test

# Backend lint (from backend/)
uv run black --check . && uv run flake8 .
```

테스트에서 `renderWithProviders` 유틸리티를 사용해주세요:

```tsx
import { renderWithProviders } from '../../test-utils';

test('renders correctly', () => {
  const { getByText } = renderWithProviders(<Component />);
  expect(getByText('Expected Text')).toBeInTheDocument();
});
```

### 9. Pull Request

- `main` 브랜치로 PR을 생성해주세요
- 모든 CI 체크(lint, type-check, test, security scan, bundle size, lighthouse)가 통과하는지 확인해주세요
- PR 설명에 변경 사항과 테스트 계획을 포함해주세요

## 프로젝트 구조

```
emelmujiro/
├── frontend/               # React 19 + TypeScript + Vite 8
│   ├── src/
│   │   ├── components/     # React 컴포넌트 (pages, common, sections, blog, layout)
│   │   ├── contexts/       # React Context (UI, Auth, Blog, Notification)
│   │   ├── services/       # API 서비스 (Axios + Mock)
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── data/           # 정적 데이터 (i18n getter 패턴)
│   │   ├── config/         # 환경 변수 설정
│   │   ├── utils/          # 유틸리티 (logger, analytics, sentry)
│   │   ├── i18n/           # 다국어 지원 (ko/en)
│   │   └── test-utils/     # 테스트 유틸리티 + MSW 목 서버
│   └── e2e/                # Playwright E2E 테스트
├── backend/                # Django 6 + DRF
│   ├── api/                # REST API (단일 앱)
│   └── config/             # Django 설정
├── scripts/                # 배포, 포트 관리, 테스트 카운트 등
└── .github/workflows/      # CI/CD 파이프라인
```

## 질문이 있으신가요?

- [GitHub Issues](https://github.com/researcherhojin/emelmujiro/issues)에 질문을 남겨주세요
- 이메일: researcherhojin@gmail.com
