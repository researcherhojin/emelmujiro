import { BlogPost, ContactFormData, User, Project } from '../index';

describe('Type definitions', () => {
  describe('BlogPost type', () => {
    it('should create valid BlogPost object', () => {
      const post: BlogPost = {
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        content: 'Test content',
        excerpt: 'Test excerpt',
        author: 'Test Author',
        publishedAt: '2024-01-01',
        imageUrl: '/image.jpg',
        tags: ['test', 'typescript'],
        category: 'Technology',
        readTime: 5,
        views: 100,
        likes: 10,
      };

      expect(post.id).toBe(1);
      expect(post.title).toBe('Test Post');
      expect(post.tags).toHaveLength(2);
    });

    it('should allow optional fields', () => {
      const minimalPost: BlogPost = {
        id: 1,
        title: 'Minimal Post',
        slug: 'minimal-post',
        content: 'Content',
        excerpt: 'Excerpt',
        author: 'Author',
        publishedAt: '2024-01-01',
      };

      expect(minimalPost.imageUrl).toBeUndefined();
      expect(minimalPost.tags).toBeUndefined();
      expect(minimalPost.category).toBeUndefined();
    });
  });

  describe('ContactFormData type', () => {
    it('should create valid ContactFormData object', () => {
      const formData: ContactFormData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '010-1234-5678',
        company: 'Test Company',
        subject: 'Inquiry',
        message: 'Test message',
      };

      expect(formData.name).toBe('John Doe');
      expect(formData.email).toBe('john@example.com');
      expect(formData.message).toBe('Test message');
    });

    it('should allow optional fields', () => {
      const minimalFormData: ContactFormData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Message',
      };

      expect(minimalFormData.phone).toBeUndefined();
      expect(minimalFormData.company).toBeUndefined();
      expect(minimalFormData.subject).toBeUndefined();
    });
  });

  describe('User type', () => {
    it('should create valid User object', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: '/avatar.jpg',
        role: 'admin',
        isActive: true,
        createdAt: '2024-01-01',
        lastLogin: '2024-01-15',
      };

      expect(user.id).toBe(1);
      expect(user.username).toBe('testuser');
      expect(user.role).toBe('admin');
      expect(user.isActive).toBe(true);
    });

    it('should allow optional avatar and lastLogin', () => {
      const minimalUser: User = {
        id: 2,
        username: 'minuser',
        email: 'min@example.com',
        firstName: 'Min',
        lastName: 'User',
        role: 'user',
        isActive: false,
        createdAt: '2024-01-01',
      };

      expect(minimalUser.avatar).toBeUndefined();
      expect(minimalUser.lastLogin).toBeUndefined();
    });
  });

  describe('Project type', () => {
    it('should create valid Project object', () => {
      const project: Project = {
        id: 1,
        title: 'Test Project',
        description: 'Test description',
        imageUrl: '/project.jpg',
        technologies: ['React', 'TypeScript'],
        githubUrl: 'https://github.com/test/project',
        liveUrl: 'https://test-project.com',
        category: 'Web Development',
        featured: true,
        completedAt: '2024-01-01',
      };

      expect(project.id).toBe(1);
      expect(project.title).toBe('Test Project');
      expect(project.technologies).toContain('React');
      expect(project.featured).toBe(true);
    });

    it('should allow optional URLs and featured flag', () => {
      const minimalProject: Project = {
        id: 2,
        title: 'Minimal Project',
        description: 'Minimal description',
        imageUrl: '/minimal.jpg',
        technologies: ['JavaScript'],
        category: 'Frontend',
        completedAt: '2024-01-01',
      };

      expect(minimalProject.githubUrl).toBeUndefined();
      expect(minimalProject.liveUrl).toBeUndefined();
      expect(minimalProject.featured).toBeUndefined();
    });
  });

  describe('Type guards', () => {
    it('should correctly identify BlogPost type', () => {
      const post = {
        id: 1,
        title: 'Test',
        slug: 'test',
        content: 'Content',
        excerpt: 'Excerpt',
        author: 'Author',
        publishedAt: '2024-01-01',
      };

      // Type guard function
      const isBlogPost = (obj: unknown): obj is BlogPost => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'id' in obj &&
          'title' in obj &&
          'content' in obj
        );
      };

      expect(isBlogPost(post)).toBe(true);
      expect(isBlogPost({})).toBe(false);
      expect(isBlogPost(null)).toBe(false);
    });

    it('should correctly identify ContactFormData type', () => {
      const formData = {
        name: 'Test',
        email: 'test@example.com',
        message: 'Message',
      };

      // Type guard function
      const isContactFormData = (obj: unknown): obj is ContactFormData => {
        return (
          typeof obj === 'object' &&
          obj !== null &&
          'name' in obj &&
          'email' in obj &&
          'message' in obj
        );
      };

      expect(isContactFormData(formData)).toBe(true);
      expect(isContactFormData({ name: 'Test' })).toBe(false);
    });
  });

  describe('Array types', () => {
    it('should handle array of BlogPosts', () => {
      const posts: BlogPost[] = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          content: 'Content 1',
          excerpt: 'Excerpt 1',
          author: 'Author 1',
          publishedAt: '2024-01-01',
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          content: 'Content 2',
          excerpt: 'Excerpt 2',
          author: 'Author 2',
          publishedAt: '2024-01-02',
        },
      ];

      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('Post 1');
      expect(posts[1].title).toBe('Post 2');
    });

    it('should handle array of Projects', () => {
      const projects: Project[] = [
        {
          id: 1,
          title: 'Project 1',
          description: 'Description 1',
          imageUrl: '/project1.jpg',
          technologies: ['React'],
          category: 'Web',
          completedAt: '2024-01-01',
        },
      ];

      expect(projects).toHaveLength(1);
      expect(projects[0].technologies).toContain('React');
    });
  });

  describe('Nested types', () => {
    it('should handle nested objects', () => {
      interface Comment {
        id: number;
        author: User;
        post: BlogPost;
        content: string;
        createdAt: string;
      }

      const comment: Comment = {
        id: 1,
        author: {
          id: 1,
          username: 'commenter',
          email: 'commenter@example.com',
          firstName: 'Comment',
          lastName: 'Author',
          role: 'user',
          isActive: true,
          createdAt: '2024-01-01',
        },
        post: {
          id: 1,
          title: 'Post',
          slug: 'post',
          content: 'Content',
          excerpt: 'Excerpt',
          author: 'Author',
          publishedAt: '2024-01-01',
        },
        content: 'Great post!',
        createdAt: '2024-01-02',
      };

      expect(comment.author.username).toBe('commenter');
      expect(comment.post.title).toBe('Post');
      expect(comment.content).toBe('Great post!');
    });
  });

  describe('Union types', () => {
    it('should handle union types correctly', () => {
      type Status = 'draft' | 'published' | 'archived';

      const statuses: Status[] = ['draft', 'published', 'archived'];

      expect(statuses).toContain('draft');
      expect(statuses).toContain('published');
      expect(statuses).toContain('archived');
    });

    it('should handle discriminated unions', () => {
      type ApiResponse<T> = { status: 'success'; data: T } | { status: 'error'; error: string };

      const successResponse: ApiResponse<BlogPost> = {
        status: 'success',
        data: {
          id: 1,
          title: 'Success',
          slug: 'success',
          content: 'Content',
          excerpt: 'Excerpt',
          author: 'Author',
          publishedAt: '2024-01-01',
        },
      };

      const errorResponse: ApiResponse<BlogPost> = {
        status: 'error',
        error: 'Something went wrong',
      };

      expect(successResponse.status).toBe('success');
      expect(errorResponse.status).toBe('error');
    });
  });
});
