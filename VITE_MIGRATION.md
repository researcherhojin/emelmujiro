# Vite 마이그레이션 가이드

## 📌 마이그레이션 필요성

현재 프로젝트는 Create React App (react-scripts)을 사용하고 있으며, 다음과 같은 이슈가 있습니다:

### 보안 취약점 (9개)

- **6개 High**: nth-check, css-select, svgo 관련
- **3개 Moderate**: postcss, webpack-dev-server 관련
- 모든 취약점이 react-scripts 내부 의존성에서 발생
- npm overrides로 해결 불가능 (react-scripts가 특정 버전 강제)

### 성능 및 개발 경험

- 빌드 속도가 느림 (Webpack 기반)
- HMR(Hot Module Replacement) 성능 이슈
- 번들 크기 최적화 제한적

## 🚀 Vite 장점

1. **보안**: 최신 의존성 사용으로 취약점 해결
2. **성능**: 10-100배 빠른 개발 서버 시작
3. **빌드**: Rollup 기반으로 더 작은 번들 크기
4. **HMR**: 즉각적인 모듈 교체
5. **TypeScript**: 네이티브 지원

## 📋 마이그레이션 체크리스트

### 1단계: 준비 작업

```bash
# 현재 상태 백업
git checkout -b vite-migration
git add -A && git commit -m "backup: before vite migration"
```

### 2단계: Vite 설치

```bash
# react-scripts 제거
npm uninstall react-scripts @craco/craco

# Vite 및 관련 패키지 설치
npm install -D vite @vitejs/plugin-react vite-tsconfig-paths vite-plugin-pwa
```

### 3단계: 설정 파일 생성

#### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: '에멜무지로',
        short_name: 'Emelmujiro',
        description: 'AI 교육 & 컨설팅 플랫폼',
        theme_color: '#000000',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  base: '/emelmujiro/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### 4단계: index.html 이동

```bash
# public/index.html을 프로젝트 루트로 이동
mv public/index.html index.html
```

#### index.html 수정

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>에멜무지로</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

### 5단계: package.json 스크립트 수정

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### 6단계: 환경 변수 마이그레이션

```bash
# .env 파일 수정
# REACT_APP_ 접두사를 VITE_ 로 변경
REACT_APP_API_URL → VITE_API_URL
```

코드에서 사용:

```typescript
// 이전
process.env.REACT_APP_API_URL;

// 이후
import.meta.env.VITE_API_URL;
```

### 7단계: 테스트 마이그레이션

```bash
# Jest 관련 패키지 제거
npm uninstall @testing-library/jest-dom jest

# Vitest 설치
npm install -D vitest @vitest/ui @testing-library/react @testing-library/user-event jsdom
```

#### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### 8단계: 코드 수정 사항

#### 1. Service Worker 등록

```typescript
// src/index.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

#### 2. 동적 임포트

```typescript
// React.lazy 사용법은 동일
const AboutPage = lazy(() => import('./pages/AboutPage'));
```

#### 3. 정적 파일 참조

```typescript
// 이전
<img src={`${process.env.PUBLIC_URL}/logo.png`} />

// 이후
<img src="/logo.png" />
```

### 9단계: GitHub Actions 수정

```yaml
# .github/workflows/main-ci-cd.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'

- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

- name: Test
  run: npm run test:coverage
```

## ⚠️ 주의사항

1. **Breaking Changes**
   - process.env → import.meta.env
   - PUBLIC_URL 제거
   - require() → import

2. **테스트 마이그레이션**
   - Jest → Vitest
   - 일부 matcher 문법 변경 필요

3. **빌드 출력**
   - build/ → dist/ (설정으로 변경 가능)

## 📊 예상 결과

### Before (CRA)

- 개발 서버 시작: 10-30초
- HMR: 2-5초
- 빌드 시간: 60-90초
- 번들 크기: 450KB (gzipped)
- 보안 취약점: 9개

### After (Vite)

- 개발 서버 시작: 1-3초
- HMR: < 100ms
- 빌드 시간: 10-20초
- 번들 크기: ~380KB (gzipped)
- 보안 취약점: 0개

## 🔗 참고 자료

- [Vite 공식 문서](https://vitejs.dev/)
- [Vite 마이그레이션 가이드](https://vitejs.dev/guide/migration)
- [Vitest 문서](https://vitest.dev/)
- [CRA to Vite](https://github.com/vitejs/vite/discussions/5185)

## 📅 예상 일정

1. **준비 및 검토**: 1일
2. **마이그레이션 구현**: 2-3일
3. **테스트 수정**: 2일
4. **CI/CD 수정**: 1일
5. **QA 및 디버깅**: 2일

**총 예상 기간**: 1-2주

## ✅ 마이그레이션 후 작업

1. 모든 테스트 통과 확인
2. 빌드 및 배포 테스트
3. 성능 벤치마크 측정
4. 보안 취약점 재검사
5. 문서 업데이트
