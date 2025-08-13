import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Eye, Download, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BlogPost } from '../../types';
import logger from '../../utils/logger';

const BlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    author: '이호진',
    image_url: '',
  });

  // Check admin mode
  useEffect(() => {
    const adminMode = localStorage.getItem('adminMode') === 'true';
    setIsAdmin(adminMode);

    // URL parameter for admin mode activation
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      localStorage.setItem('adminMode', 'true');
      setIsAdmin(true);
    }
  }, []);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save post to localStorage
  const handleSave = () => {
    if (!formData.title || !formData.content) {
      alert('제목과 내용은 필수입니다.');
      return;
    }

    try {
      const newPost: BlogPost = {
        id: Date.now(),
        title: formData.title,
        slug: formData.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
        excerpt: formData.excerpt || formData.content.substring(0, 150) + '...',
        content: formData.content,
        author: formData.author,
        publishedAt: new Date().toISOString().split('T')[0],
        category: formData.category || '일반',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        image_url:
          formData.image_url ||
          `https://source.unsplash.com/800x400/?${formData.category || 'technology'}`,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published: true,
      };

      // Get existing posts from localStorage
      const postsData = localStorage.getItem('customBlogPosts');
      const existingPosts = postsData ? JSON.parse(postsData) : [];
      const updatedPosts = [newPost, ...existingPosts];

      // Save to localStorage
      localStorage.setItem('customBlogPosts', JSON.stringify(updatedPosts));

      alert('포스트가 저장되었습니다!');

      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        author: '이호진',
        image_url: '',
      });

      // Navigate to blog
      navigate('/blog');
    } catch (error) {
      logger.error('Failed to save post:', error);
      alert('포스트 저장 중 오류가 발생했습니다.');
    }
  };

  // Export posts as JSON
  const handleExport = () => {
    try {
      const customPosts = localStorage.getItem('customBlogPosts');
      const posts = customPosts ? JSON.parse(customPosts) : [];
      const dataStr = JSON.stringify(posts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `blog-posts-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      logger.error('Failed to export posts:', error);
      alert('포스트 내보내기 중 오류가 발생했습니다.');
    }
  };

  // Import posts from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Invalid file content');
        }

        const posts = JSON.parse(result);
        if (!Array.isArray(posts)) {
          throw new Error('Invalid JSON format: expected array');
        }

        const existingData = localStorage.getItem('customBlogPosts');
        const existingPosts = existingData ? JSON.parse(existingData) : [];
        const mergedPosts = [...posts, ...existingPosts];

        // Remove duplicates based on ID
        const uniquePosts = mergedPosts.filter(
          (post, index, self) => index === self.findIndex(p => p.id === post.id)
        );

        localStorage.setItem('customBlogPosts', JSON.stringify(uniquePosts));
        alert(`${posts.length}개의 포스트를 가져왔습니다!`);
      } catch {
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  // Categories
  const categories = ['AI', '웹개발', '프론트엔드', 'DevOps', '교육', '프로그래밍', '일반'];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">관리자 모드가 필요합니다</h2>
          <p className="text-gray-600 mb-8">블로그 글을 작성하려면 관리자 권한이 필요합니다.</p>
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-4">
              관리자 모드를 활성화하려면 URL에{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">?admin=true</code>를 추가하세요.
            </p>
            <button
              onClick={() => {
                window.location.href = window.location.pathname + '?admin=true';
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              관리자 모드 활성화
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">블로그 글쓰기</h1>
          <div className="flex gap-2">
            <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              JSON 가져오기
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleExport}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              JSON 내보내기
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">편집기</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">제목 *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="포스트 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">요약</label>
                <input
                  type="text"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="간단한 요약 (비워두면 자동 생성)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">카테고리</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">작성자</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="React, TypeScript, 웹개발"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">이미지 URL</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg (비워두면 자동 생성)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">내용 * (Markdown 지원)</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={15}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="## 제목&#10;&#10;내용을 작성하세요...&#10;&#10;- 리스트 항목&#10;- **굵은 글씨**&#10;- *기울임*"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? '편집기' : '미리보기'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">미리보기</h2>

            <article className="prose prose-indigo max-w-none">
              {formData.image_url && (
                <img
                  src={formData.image_url}
                  alt={formData.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              {formData.category && (
                <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full mb-2">
                  {formData.category}
                </span>
              )}

              <h1>{formData.title || '제목을 입력하세요'}</h1>

              {formData.tags && (
                <div className="flex gap-2 mb-4">
                  {formData.tags.split(',').map((tag, index) => (
                    <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {formData.excerpt && <p className="text-gray-600 italic">{formData.excerpt}</p>}

              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {formData.content || '*내용을 입력하세요...*'}
              </ReactMarkdown>
            </article>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">📝 사용 방법</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 작성한 글은 브라우저의 localStorage에 저장됩니다</li>
            <li>• JSON 내보내기로 포스트를 백업할 수 있습니다</li>
            <li>• JSON 파일을 수정하여 대량의 포스트를 추가할 수 있습니다</li>
            <li>
              • 실제 배포 시에는 <code className="bg-yellow-100 px-1">blogPosts.js</code> 파일에
              직접 추가하는 것을 추천합니다
            </li>
            <li>• Markdown 문법을 사용하여 풍부한 콘텐츠를 작성할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
