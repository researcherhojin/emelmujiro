# Frontend Development Guide

## 🚀 Performance & Development Improvements

이 프로젝트는 다음과 같은 최적화 및 개발 도구가 적용되었습니다:

### ✨ 성능 최적화

#### 1. 번들 최적화

- **Dynamic Imports**: 메인 페이지 섹션들이 lazy loading으로 분할됨
- **Bundle Analyzer**: `npm run analyze` 또는 `npm run analyze:build`
- **Profile Build**: `npm run build:profile`로 성능 프로파일링

#### 2. 이미지 최적화

- **WebP 지원**: LazyImage 컴포넌트에서 WebP 자동 변환
- **Responsive Images**: srcSet 및 sizes 속성 지원
- **Blur Placeholder**: 로딩 중 블러 효과 지원
- **Priority Loading**: 중요한 이미지에 대한 즉시 로딩

```tsx
<LazyImage
  src="/image.jpg"
  webpSrc="/image.webp"
  srcSet="/image-320w.jpg 320w, /image-640w.jpg 640w, /image-1280w.jpg 1280w"
  sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 1200px"
  blurDataURL="data:image/jpeg;base64,..."
  priority={true}
  alt="Image description"
/>
```

#### 3. 로딩 상태 개선

- **스켈레톤 스크린**: 다양한 콘텐츠 타입별 스켈레톤 로더
- **Progressive Loading**: 점진적 콘텐츠 로딩
- **Optimistic Updates**: 사용자 상호작용에 대한 즉시 피드백

```tsx
<Loading type="hero" />        // Hero 섹션 스켈레톤
<Loading type="services" />    // 서비스 카드 스켈레톤
<Loading type="blog" />        // 블로그 리스트 스켈레톤
<Loading type="form" />        // 폼 스켈레톤
```

### 🧪 테스트 커버리지

#### Context API 테스트

- **BlogContext**: 블로그 상태 관리 테스트
- **AuthContext**: 인증 상태 관리 테스트
- **UIContext**: UI 상태 관리 테스트
- **통합 테스트**: 전체 플로우 테스트

#### 테스트 실행

```bash
npm run test                # 단위 테스트
npm run test:coverage      # 커버리지 포함 테스트
npm run test:e2e          # E2E 테스트
npm run test:e2e:ui       # E2E UI 모드
```

### 🛠 개발 도구

#### Pre-commit Hooks

- **ESLint**: 코드 품질 검사 및 자동 수정
- **Prettier**: 코드 포매팅 자동화
- **Type Check**: TypeScript 타입 검사

#### 개발 스크립트

```bash
npm run dev              # 개발 서버 시작
npm run validate         # 전체 검증 (lint + type-check + test)
npm run type-check       # TypeScript 타입 검사
npm run type-check:watch # TypeScript 타입 검사 (감시 모드)
npm run clean           # 빌드 캐시 정리
npm run clean:all       # 모든 생성 파일 정리
```

#### IDE 설정

- **VS Code 설정**: 자동 포매팅 및 ESLint 수정
- **추천 확장**: Prettier, ESLint, Tailwind CSS 등
- **Tailwind CSS 자동완성**: 클래스명 인텔리센스

### 🔄 CI/CD 파이프라인

#### GitHub Actions

- **다중 Node.js 버전 테스트**: 18.x, 20.x
- **코드 품질 검사**: ESLint, TypeScript
- **테스트 실행**: 단위 테스트 + E2E 테스트
- **보안 검사**: npm audit, Snyk
- **성능 검사**: Lighthouse CI
- **자동 배포**: GitHub Pages

#### 코드 품질 게이트

```yaml
✅ Lint 검사 통과
✅ TypeScript 타입 검사 통과
✅ 테스트 커버리지 80% 이상
✅ E2E 테스트 통과
✅ Lighthouse 점수 90점 이상
✅ 보안 취약점 없음
```

## 📦 아키텍처 개선사항

### 컴포넌트 구조

```
src/
├── components/
│   ├── common/           # 재사용 가능한 공통 컴포넌트
│   │   ├── Loading.tsx   # 통합 로딩 컴포넌트 (스켈레톤 포함)
│   │   ├── LazyImage.tsx # 최적화된 이미지 컴포넌트
│   │   └── SkeletonLoader.tsx # 스켈레톤 스크린 컴포넌트
│   ├── sections/         # 페이지 섹션 (Lazy Loaded)
│   └── pages/           # 페이지 컴포넌트
├── contexts/            # Context API + 테스트
├── services/            # API 서비스 + 통합 테스트
├── test-utils/          # 테스트 유틸리티
└── __tests__/           # 통합 테스트
```

### 타입 안전성

- **100% TypeScript 커버리지**: 모든 JS 파일이 TS로 변환됨
- **엄격한 타입 검사**: 런타임 오류 방지
- **Discriminated Unions**: 타입 안전한 컴포넌트 props

### 성능 메트릭스 목표

- **First Contentful Paint**: < 1.5초
- **Largest Contentful Paint**: < 2.5초
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **번들 크기**: 30-40% 감소 (Dynamic imports)

## 🎯 사용법

### 새로운 컴포넌트 개발

1. TypeScript로 컴포넌트 작성
2. 테스트 파일 작성 (`*.test.tsx`)
3. 스토리북 스토리 작성 (선택사항)
4. 커밋 전 `npm run validate` 실행

### 이미지 추가

```tsx
// 기본 사용법
<LazyImage src="/path/to/image.jpg" alt="Description" />

// 최적화된 사용법
<LazyImage
  src="/image.jpg"
  webpSrc="/image.webp"
  srcSet="/image-320w.jpg 320w, /image-640w.jpg 640w"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={true} // Above-the-fold 이미지용
  blurDataURL="data:image/jpeg;base64,..." // 블러 플레이스홀더
/>
```

### 로딩 상태 추가

```tsx
// 페이지별 스켈레톤
{loading && <Loading type="blog" />}
{loading && <Loading type="services" />}

// 사용자 정의 스켈레톤
<SkeletonCard />
<SkeletonText lines={3} />
<SkeletonListItem />
```

이러한 개선사항들을 통해 **더 빠르고, 안정적이며, 유지보수가 용이한** 프론트엔드 애플리케이션을 구축했습니다.
