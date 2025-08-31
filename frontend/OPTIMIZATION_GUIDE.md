# 🚀 Performance Optimization Guide

## 📋 목차

1. [개요](#개요)
2. [최적화된 컴포넌트](#최적화된-컴포넌트)
3. [이미지 최적화](#이미지-최적화)
4. [Virtual Scrolling](#virtual-scrolling)
5. [성능 모니터링](#성능-모니터링)
6. [상태 관리 (Zustand)](#상태-관리-zustand)
7. [테스트 개선](#테스트-개선)
8. [마이그레이션 가이드](#마이그레이션-가이드)

## 개요

이 문서는 에멜무지로 프로젝트의 성능 최적화 구현 사항과 사용 방법을 설명합니다.

### 주요 개선 사항

- ✅ React.memo와 useMemo를 활용한 리렌더링 최적화
- ✅ WebP 지원 및 lazy loading을 통한 이미지 최적화
- ✅ Virtual Scrolling으로 대량 데이터 처리
- ✅ Zustand를 통한 효율적인 상태 관리
- ✅ 향상된 테스트 격리 및 안정성

## 최적화된 컴포넌트

### OptimizedButton

```tsx
import { OptimizedButton } from '@/components/common/OptimizedComponents';

// 기본 사용
<OptimizedButton
  variant="primary"
  size="md"
  onClick={handleClick}
>
  Click Me
</OptimizedButton>

// 로딩 상태
<OptimizedButton
  loading={isLoading}
  disabled={isLoading}
>
  {isLoading ? 'Processing...' : 'Submit'}
</OptimizedButton>

// 아이콘 포함
<OptimizedButton
  variant="secondary"
  icon={<SaveIcon />}
  iconPosition="left"
>
  Save Changes
</OptimizedButton>
```

### OptimizedCard

```tsx
import { OptimizedCard } from '@/components/common/OptimizedComponents';

<OptimizedCard
  title="AI 솔루션"
  description="맞춤형 AI 솔루션 개발"
  image="/images/ai-solution.jpg"
  onClick={() => navigate('/solutions')}
>
  <OptimizedButton variant="primary">자세히 보기</OptimizedButton>
</OptimizedCard>;
```

### OptimizedInput

```tsx
import { OptimizedInput } from '@/components/common/OptimizedComponents';

const [email, setEmail] = useState('');
const [error, setError] = useState('');

<OptimizedInput
  type="email"
  label="이메일"
  value={email}
  onChange={setEmail}
  placeholder="example@email.com"
  error={error}
  required
/>;
```

## 이미지 최적화

### ImageOptimized 컴포넌트

자동 WebP 변환, lazy loading, responsive images를 지원합니다.

```tsx
import { ImageOptimized } from '@/components/common/ImageOptimized';

// 기본 사용
<ImageOptimized
  src="/images/hero.jpg"
  alt="Hero Image"
  width={1200}
  height={600}
  objectFit="cover"
/>

// Priority 이미지 (LCP 최적화)
<ImageOptimized
  src="/images/above-fold.jpg"
  alt="Important Image"
  priority
  loading="eager"
/>

// Blur placeholder
<ImageOptimized
  src="/images/product.jpg"
  alt="Product"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Responsive images
<ImageOptimized
  src="/images/responsive.jpg"
  alt="Responsive"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  srcSet="/images/responsive-400w.jpg 400w, /images/responsive-800w.jpg 800w"
/>
```

### ImageGallery

```tsx
import { ImageGallery } from '@/components/common/ImageOptimized';

const images = [
  { src: '/img1.jpg', alt: 'Image 1', caption: 'Caption 1' },
  { src: '/img2.jpg', alt: 'Image 2', caption: 'Caption 2' },
];

<ImageGallery images={images} columns={3} gap={4} />;
```

### BackgroundImage

```tsx
import { BackgroundImage } from '@/components/common/ImageOptimized';

<BackgroundImage
  src="/images/bg.jpg"
  overlay
  overlayOpacity={0.6}
  parallax
  className="h-screen"
>
  <div className="text-white text-center">
    <h1>Hero Section</h1>
  </div>
</BackgroundImage>;
```

## Virtual Scrolling

### VirtualList - 대량 리스트 렌더링

```tsx
import { VirtualList } from '@/components/common/VirtualList';

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  title: `Item ${i}`,
  description: `Description ${i}`,
}));

<VirtualList
  items={items}
  height={600}
  itemHeight={80}
  renderItem={(item) => (
    <div className="p-4 border-b">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
  overscan={5}
  onEndReached={loadMore}
  endReachedThreshold={0.8}
/>;
```

### VirtualGrid - 그리드 레이아웃

```tsx
import { VirtualGrid } from '@/components/common/VirtualList';

<VirtualGrid
  items={products}
  height={800}
  columnCount={3}
  rowHeight={300}
  gap={16}
  renderItem={(product) => <ProductCard {...product} />}
/>;
```

### DynamicVirtualList - 가변 높이 아이템

```tsx
import { DynamicVirtualList } from '@/components/common/VirtualList';

<DynamicVirtualList
  items={comments}
  height={600}
  estimatedItemHeight={100}
  renderItem={(comment) => <CommentCard {...comment} />}
/>;
```

## 성능 모니터링

### 기본 설정

```tsx
import performanceMonitor, {
  markPerformance,
  measurePerformance,
  subscribeToPerformance,
} from '@/utils/performanceMonitor';

// 컴포넌트 로드 시간 측정
useEffect(() => {
  markPerformance('component-start');

  // 컴포넌트 초기화 로직...

  const loadTime = measurePerformance('component-load', 'component-start');
  console.log(`Component loaded in ${loadTime}ms`);
}, []);

// 성능 리포트 구독
useEffect(() => {
  const unsubscribe = subscribeToPerformance((report) => {
    console.log('Performance Report:', report);

    // 분석 도구로 전송
    if (report.metrics.get('LCP')?.value > 2500) {
      console.warn('LCP is above recommended threshold');
    }
  });

  return unsubscribe;
}, []);
```

### 커스텀 메트릭 기록

```tsx
import { recordMetric } from '@/utils/performanceMonitor';

// API 호출 시간 측정
const fetchData = async () => {
  const start = performance.now();

  try {
    const data = await api.get('/data');
    const duration = performance.now() - start;

    recordMetric('api-response-time', duration, {
      endpoint: '/data',
      success: true,
    });

    return data;
  } catch (error) {
    const duration = performance.now() - start;

    recordMetric('api-response-time', duration, {
      endpoint: '/data',
      success: false,
      error: error.message,
    });

    throw error;
  }
};
```

## 상태 관리 (Zustand)

### Store 사용

```tsx
import useAppStore from '@/store/useAppStore';
import { useTheme, useUser, useNotifications } from '@/store/useAppStore';

// 전체 스토어 사용
function Component() {
  const store = useAppStore();
  const { theme, setTheme, user, login, logout } = store;

  return (
    <div>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  );
}

// 선택적 구독 (최적화)
function ThemeToggle() {
  const theme = useTheme();
  const setTheme = useAppStore((state) => state.setTheme);

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}

// 알림 관리
function NotificationManager() {
  const notifications = useNotifications();
  const { addNotification, removeNotification } = useAppStore();

  const showSuccess = () => {
    addNotification({
      type: 'success',
      message: '작업이 완료되었습니다!',
    });
  };

  return (
    <div>
      {notifications.map((notification) => (
        <div key={notification.id}>
          {notification.message}
          <button onClick={() => removeNotification(notification.id)}>
            닫기
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 블로그 상태 관리

```tsx
import useAppStore from '@/store/useAppStore';

function BlogManager() {
  const { posts, addPost, updatePost, deletePost, isLoadingPosts } =
    useAppStore();

  const handleCreatePost = async (postData) => {
    const newPost = {
      id: crypto.randomUUID(),
      ...postData,
      createdAt: new Date().toISOString(),
    };

    addPost(newPost);
  };

  const handleUpdatePost = (id, updates) => {
    updatePost(id, updates);
  };

  return (
    <div>
      {isLoadingPosts ? (
        <LoadingSpinner />
      ) : (
        posts.map((post) => (
          <BlogPost
            key={post.id}
            {...post}
            onUpdate={(updates) => handleUpdatePost(post.id, updates)}
            onDelete={() => deletePost(post.id)}
          />
        ))
      )}
    </div>
  );
}
```

## 테스트 개선

### Enhanced Cleanup 사용

```tsx
import {
  enhancedCleanup,
  setupTimerTracking,
  flushPromises,
} from '@/test-utils/cleanup';
import { renderWithProviders } from '@/test-utils/test-utils';

describe('Component Test', () => {
  beforeEach(() => {
    setupTimerTracking();
  });

  afterEach(() => {
    enhancedCleanup();
  });

  it('handles async operations', async () => {
    const { getByText } = renderWithProviders(<Component />);

    fireEvent.click(getByText('Load Data'));

    // 모든 promise 대기
    await flushPromises();

    expect(getByText('Data Loaded')).toBeInTheDocument();
  });
});
```

### 개선된 테스트 파일 실행

```bash
# 개선된 테스트 실행
npm test -- --run src/components/common/__tests__/WebVitalsDashboard.improved.test.tsx
npm test -- --run src/components/pages/__tests__/ContactPage.improved.test.tsx

# 전체 테스트 실행
CI=true npm test -- --run
```

## 마이그레이션 가이드

### 1단계: 의존성 설치

```bash
npm install zustand @tanstack/react-virtual
```

### 2단계: 컴포넌트 교체

```tsx
// Before
import Button from '@/components/common/Button';

// After
import { OptimizedButton as Button } from '@/components/common/OptimizedComponents';
```

### 3단계: 이미지 컴포넌트 교체

```tsx
// Before
<img src="/image.jpg" alt="Image" loading="lazy" />

// After
<ImageOptimized
  src="/image.jpg"
  alt="Image"
  objectFit="cover"
/>
```

### 4단계: 대량 리스트 최적화

```tsx
// Before
{
  items.map((item) => <ItemComponent key={item.id} {...item} />);
}

// After
<VirtualList
  items={items}
  height={600}
  renderItem={(item) => <ItemComponent {...item} />}
/>;
```

### 5단계: Context를 Zustand로 마이그레이션

```tsx
// Before
const { theme } = useUIContext();

// After
const theme = useTheme(); // from Zustand store
```

## 성능 체크리스트

- [ ] 모든 리스트 컴포넌트에 `key` prop 사용
- [ ] 대량 리스트는 Virtual Scrolling 적용
- [ ] 이미지는 WebP 포맷 제공
- [ ] Above-the-fold 이미지는 `priority` 설정
- [ ] 무거운 계산은 `useMemo` 사용
- [ ] 콜백 함수는 `useCallback` 사용
- [ ] 정적 컴포넌트는 `React.memo` 적용
- [ ] 번들 크기 모니터링 (`npm run analyze:bundle`)
- [ ] Lighthouse 점수 확인
- [ ] 성능 메트릭 모니터링 설정

## 트러블슈팅

### 문제: Virtual List 아이템이 겹침

```tsx
// 해결: itemHeight를 정확히 설정
<VirtualList
  itemHeight={80} // padding과 border 포함한 전체 높이
  // 또는 동적 높이 사용
  <DynamicVirtualList estimatedItemHeight={100} />
/>
```

### 문제: 이미지 로딩이 느림

```tsx
// 해결: priority와 sizes 최적화
<ImageOptimized
  priority // LCP 이미지
  sizes="(max-width: 640px) 100vw, 50vw" // 정확한 크기 명시
  src="/image.jpg"
/>
```

### 문제: Zustand 상태가 새로고침 시 사라짐

```tsx
// 해결: persist 미들웨어 확인
// useAppStore.ts에서 persist 설정이 되어있는지 확인
persist(
  (set) => ({...}),
  {
    name: 'app-store', // localStorage key
    partialize: (state) => ({ // 저장할 상태 선택
      theme: state.theme,
      user: state.user,
    }),
  }
)
```

## 추가 리소스

- [React 성능 최적화 공식 문서](https://react.dev/learn/render-and-commit)
- [Web Vitals 가이드](https://web.dev/vitals/)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [TanStack Virtual 문서](https://tanstack.com/virtual/latest)
