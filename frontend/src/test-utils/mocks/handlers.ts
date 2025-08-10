import { http, HttpResponse } from 'msw';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Type definitions for request bodies
interface ContactData {
  name: string;
  email: string;
  message: string;
}

interface NewsletterData {
  email: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

export const handlers = [
  // Blog endpoints
  http.get(`${API_BASE}/blog`, () => {
    return HttpResponse.json({
      results: [
        {
          id: 1,
          title: 'Test Blog Post',
          description: 'Test description',
          content: 'Test content',
          category: 'ai_development',
          category_display: 'AI 개발',
          date: '2025-01-01T00:00:00Z',
          formatted_date: '2025년 1월 1일',
          relative_date: '1일 전',
          image_url: 'https://example.com/image.jpg',
          is_featured: true,
          view_count: 100,
        },
      ],
      count: 1,
      next: null,
      previous: null,
    });
  }),

  http.get(`${API_BASE}/blog/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      title: 'Test Blog Post',
      description: 'Test description',
      content: '# Test Content\n\nThis is a test blog post.',
      category: 'ai_development',
      category_display: 'AI 개발',
      date: '2025-01-01T00:00:00Z',
      formatted_date: '2025년 1월 1일',
      relative_date: '1일 전',
      image_url: 'https://example.com/image.jpg',
      is_featured: true,
      view_count: 100,
    });
  }),

  // Contact endpoint
  http.post(`${API_BASE}/contact/`, async ({ request }) => {
    const data = (await request.json()) as ContactData;
    return HttpResponse.json(
      {
        id: 1,
        name: data.name,
        email: data.email,
        message: data.message,
        created_at: new Date().toISOString(),
        status: 'pending',
      },
      { status: 201 }
    );
  }),

  // Newsletter endpoint
  http.post(`${API_BASE}/newsletter/`, async ({ request }) => {
    const data = (await request.json()) as NewsletterData;
    return HttpResponse.json(
      {
        id: 1,
        email: data.email,
        subscribed_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Auth endpoints
  http.post(`${API_BASE}/auth/register/`, async ({ request }) => {
    const data = (await request.json()) as RegisterData;
    return HttpResponse.json(
      {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 1,
          username: data.username,
          email: data.email,
        },
      },
      { status: 201 }
    );
  }),

  http.post(`${API_BASE}/auth/login/`, async ({ request }) => {
    const data = (await request.json()) as LoginData;
    if (data.username === 'testuser' && data.password === 'testpass123') {
      return HttpResponse.json({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
        },
      });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post(`${API_BASE}/auth/logout/`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get(`${API_BASE}/auth/user/`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.includes('mock-access-token')) {
      return HttpResponse.json({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      });
    }
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),

  // Categories endpoint
  http.get(`${API_BASE}/categories/`, () => {
    return HttpResponse.json([
      { value: 'ai_development', label: 'AI 개발' },
      { value: 'data_analysis', label: '데이터 분석' },
      { value: 'education', label: '교육' },
      { value: 'consulting', label: '컨설팅' },
    ]);
  }),

  // Health check
  http.get(`${API_BASE}/health/`, () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }),
];
