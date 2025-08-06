import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { api } from '../api';
import { BlogPost, ContactFormData } from '../../types';

describe('API Service', () => {
    let mock: MockAdapter;

    beforeEach(() => {
        mock = new MockAdapter(axios);
        localStorage.clear();
    });

    afterEach(() => {
        mock.restore();
    });

    describe('Request Interceptor', () => {
        it('should add auth token to headers if available', async () => {
            localStorage.setItem('authToken', 'test-token');
            mock.onGet('/api/health/').reply(200, { status: 'ok' });

            await api.checkHealth();

            expect(mock.history.get[0].headers?.Authorization).toBe('Bearer test-token');
        });

        it('should not add auth token if not available', async () => {
            mock.onGet('/api/health/').reply(200, { status: 'ok' });

            await api.checkHealth();

            expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
        });
    });

    describe('Response Interceptor', () => {
        it('should handle network errors', async () => {
            mock.onGet('/api/health/').networkError();

            await expect(api.checkHealth()).rejects.toThrow('네트워크 연결을 확인해주세요.');
        });

        it('should handle timeout and retry', async () => {
            let attempts = 0;
            mock.onGet('/api/health/').reply(() => {
                attempts++;
                if (attempts === 1) {
                    return [0, null, { code: 'ECONNABORTED' }];
                }
                return [200, { status: 'ok' }];
            });

            const response = await api.checkHealth();
            expect(response.data).toEqual({ status: 'ok' });
            expect(attempts).toBe(2);
        });

        it('should handle 401 errors and clear auth token', async () => {
            localStorage.setItem('authToken', 'test-token');
            mock.onGet('/api/health/').reply(401);

            await expect(api.checkHealth()).rejects.toThrow();
            expect(localStorage.getItem('authToken')).toBeNull();
        });

        it('should map error messages based on status code', async () => {
            mock.onGet('/api/health/').reply(429);

            try {
                await api.checkHealth();
            } catch (error: any) {
                expect(error.userMessage).toBe('너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.');
            }
        });
    });

    describe('Blog API', () => {
        it('should fetch blog posts with pagination', async () => {
            const mockPosts: BlogPost[] = [
                {
                    id: 1,
                    title: 'Test Post',
                    slug: 'test-post',
                    content: 'Test content',
                    excerpt: 'Test excerpt',
                    author: 'Test Author',
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                    published: true,
                },
            ];

            mock.onGet('/api/blog-posts/?page=1').reply(200, {
                count: 1,
                next: null,
                previous: null,
                results: mockPosts,
            });

            const response = await api.getBlogPosts(1);
            expect(response.data.results).toEqual(mockPosts);
        });

        it('should fetch a single blog post', async () => {
            const mockPost: BlogPost = {
                id: 1,
                title: 'Test Post',
                slug: 'test-post',
                content: 'Test content',
                excerpt: 'Test excerpt',
                author: 'Test Author',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                published: true,
            };

            mock.onGet('/api/blog-posts/1/').reply(200, mockPost);

            const response = await api.getBlogPost(1);
            expect(response.data).toEqual(mockPost);
        });
    });

    describe('Contact API', () => {
        it('should submit contact form successfully', async () => {
            const contactData: ContactFormData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Test message',
            };

            mock.onPost('/api/contact/').reply(201, { id: 1, ...contactData });

            const response = await api.createContact(contactData);
            expect(response.status).toBe(201);
        });

        it('should handle rate limiting for contact form', async () => {
            const contactData: ContactFormData = {
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Test message',
            };

            mock.onPost('/api/contact/').reply(429);

            try {
                await api.createContact(contactData);
            } catch (error: any) {
                expect(error.userMessage).toBe('너무 많은 문의를 보내셨습니다. 1시간 후에 다시 시도해주세요.');
            }
        });
    });

    describe('Newsletter API', () => {
        it('should subscribe to newsletter', async () => {
            const email = 'test@example.com';
            mock.onPost('/api/newsletter/').reply(201, { email, subscribed: true });

            const response = await api.subscribeNewsletter(email);
            expect(response.data).toEqual({ email, subscribed: true });
        });
    });

    describe('Projects API', () => {
        it('should fetch projects', async () => {
            const mockProjects = [
                {
                    id: 1,
                    title: 'Project 1',
                    description: 'Description 1',
                    technologies: ['React', 'TypeScript'],
                },
            ];

            mock.onGet('/api/projects/').reply(200, mockProjects);

            const response = await api.getProjects();
            expect(response.data).toEqual(mockProjects);
        });

        it('should create a new project', async () => {
            const newProject = {
                title: 'New Project',
                description: 'New Description',
                technologies: ['React', 'Node.js'],
            };

            mock.onPost('/api/projects/').reply(201, { id: 1, ...newProject });

            const response = await api.createProject(newProject);
            expect(response.data).toEqual({ id: 1, ...newProject });
        });
    });
});