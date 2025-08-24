import { BlogPost } from '../types';

// Mock blog posts data
export const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'AI 기술의 미래와 우리의 준비',
    content:
      'AI 기술이 급속도로 발전하면서 우리의 일상과 업무 방식이 크게 변화하고 있습니다. 이 글에서는 AI 기술의 현재와 미래, 그리고 우리가 어떻게 준비해야 하는지에 대해 다룹니다.',
    excerpt: 'AI 기술의 발전과 미래 전망',
    image_url: '/images/blog/ai-future.jpg',
    author: '이호진',
    publishedAt: '2024-03-15',
    created_at: '2024-03-15T09:00:00Z',
    updated_at: '2024-03-15T09:00:00Z',
    category: 'AI Technology',
    tags: ['AI', '미래기술', '디지털전환'],
    views: 245,
    likes: 38,
    published: true,
    slug: 'ai-future-preparation',
  },
  {
    id: 2,
    title: '실전에서 배우는 머신러닝 최적화 기법',
    content:
      '머신러닝 모델의 성능을 향상시키는 다양한 최적화 기법들을 실제 프로젝트 경험을 바탕으로 소개합니다.',
    excerpt: '머신러닝 모델 최적화 실전 가이드',
    image_url: '/images/blog/ml-optimization.jpg',
    author: '이호진',
    publishedAt: '2024-03-10',
    created_at: '2024-03-10T14:30:00Z',
    updated_at: '2024-03-10T14:30:00Z',
    category: 'Machine Learning',
    tags: ['머신러닝', '최적화', '성능향상'],
    views: 189,
    likes: 27,
    published: true,
    slug: 'ml-optimization-guide',
  },
  {
    id: 3,
    title: '기업의 디지털 전환, 어떻게 시작할까?',
    content:
      '많은 기업들이 디지털 전환을 고민하지만 어디서부터 시작해야 할지 막막합니다. 단계별 접근 방법을 제시합니다.',
    excerpt: '디지털 전환 시작 가이드',
    image_url: '/images/blog/digital-transformation.jpg',
    author: '이호진',
    publishedAt: '2024-03-05',
    created_at: '2024-03-05T11:00:00Z',
    updated_at: '2024-03-05T11:00:00Z',
    category: 'Digital Transformation',
    tags: ['디지털전환', '기업전략', 'DX'],
    views: 312,
    likes: 45,
    published: true,
    slug: 'digital-transformation-start',
  },
  {
    id: 4,
    title: 'ChatGPT API를 활용한 실무 자동화',
    content:
      'ChatGPT API를 활용하여 실무에서 반복적인 작업을 자동화하는 방법과 실제 구현 사례를 공유합니다.',
    excerpt: 'ChatGPT로 업무 자동화하기',
    image_url: '/images/blog/chatgpt-automation.jpg',
    author: '이호진',
    publishedAt: '2024-02-28',
    created_at: '2024-02-28T16:20:00Z',
    updated_at: '2024-02-28T16:20:00Z',
    category: 'AI Application',
    tags: ['ChatGPT', '자동화', 'API'],
    views: 567,
    likes: 89,
    published: true,
    slug: 'chatgpt-automation',
  },
  {
    id: 5,
    title: '데이터 기반 의사결정의 중요성',
    content:
      '감에 의존한 의사결정에서 벗어나 데이터를 기반으로 한 합리적인 의사결정 체계를 구축하는 방법을 소개합니다.',
    excerpt: '데이터 드리븐 의사결정 체계 구축',
    image_url: '/images/blog/data-driven.jpg',
    author: '이호진',
    publishedAt: '2024-02-20',
    created_at: '2024-02-20T10:15:00Z',
    updated_at: '2024-02-20T10:15:00Z',
    category: 'Data Science',
    tags: ['데이터분석', '의사결정', '비즈니스'],
    views: 234,
    likes: 31,
    published: true,
    slug: 'data-driven-decision',
  },
  {
    id: 6,
    title: 'AI 교육 프로그램 설계의 핵심 요소',
    content:
      '효과적인 AI 교육 프로그램을 설계하기 위한 핵심 요소들과 실제 교육 현장에서의 경험을 공유합니다.',
    excerpt: 'AI 교육 프로그램 설계 가이드',
    image_url: '/images/blog/ai-education.jpg',
    author: '이호진',
    publishedAt: '2024-02-15',
    created_at: '2024-02-15T13:45:00Z',
    updated_at: '2024-02-15T13:45:00Z',
    category: 'Education',
    tags: ['AI교육', '커리큘럼', '교육설계'],
    views: 178,
    likes: 24,
    published: true,
    slug: 'ai-education-design',
  },
];

// Mock categories with id, name, and slug
export const mockCategories = [
  { id: 1, name: 'AI Technology', slug: 'ai-technology' },
  { id: 2, name: 'Machine Learning', slug: 'machine-learning' },
  { id: 3, name: 'Digital Transformation', slug: 'digital-transformation' },
  { id: 4, name: 'AI Application', slug: 'ai-application' },
  { id: 5, name: 'Data Science', slug: 'data-science' },
  { id: 6, name: 'Education', slug: 'education' },
];

// Helper function to paginate data
export function paginateMockData<T>(data: T[], page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  // Add createdAt field for blog posts
  const resultsWithCreatedAt = paginatedData.map((item) => {
    const itemWithCreatedAt = item as T & {
      created_at?: string;
      createdAt?: string;
    };
    if (itemWithCreatedAt.created_at && !itemWithCreatedAt.createdAt) {
      return { ...itemWithCreatedAt, createdAt: itemWithCreatedAt.created_at };
    }
    return item;
  });

  return {
    count: data.length,
    next: endIndex < data.length ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results: resultsWithCreatedAt,
  };
}
