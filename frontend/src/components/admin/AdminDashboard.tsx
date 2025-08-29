import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Bell,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import logger from '../../utils/logger';
// import { api } from '../../services/api'; // Currently using mock data

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalMessages: number;
  totalViews: number;
}

interface ContentItem {
  id: string | number;
  title: string;
  type: 'blog' | 'page' | 'notification';
  status: 'published' | 'draft' | 'archived';
  author: string;
  createdAt: string;
  views?: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalMessages: 0,
    totalViews: 0,
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats and content
      // This would be replaced with actual API calls
      setStats({
        totalUsers: 1234,
        totalPosts: 56,
        totalMessages: 789,
        totalViews: 45678,
      });

      setContentItems([
        {
          id: 1,
          title: 'AI 교육의 미래',
          type: 'blog',
          status: 'published',
          author: '관리자',
          createdAt: '2024-01-15',
          views: 1234,
        },
        {
          id: 2,
          title: '새로운 교육 프로그램 안내',
          type: 'page',
          status: 'draft',
          author: '관리자',
          createdAt: '2024-01-14',
          views: 567,
        },
      ]);
    } catch (error) {
      logger.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    // Navigate to content creation page
    // Implementation pending
  };

  const handleEditContent = (_id: string | number) => {
    // Navigate to content edit page
    // Implementation pending
  };

  const handleDeleteContent = (id: string | number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      // Delete content
      setContentItems(contentItems.filter((item) => item.id !== id));
    }
  };

  const handleViewContent = (_id: string | number) => {
    // Navigate to content view page
    // Implementation pending
  };

  const renderSidebar = () => (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold">관리자 대시보드</h2>
      </div>
      <nav className="mt-6">
        {[
          { id: 'overview', label: '개요', icon: LayoutDashboard },
          { id: 'content', label: '콘텐츠 관리', icon: FileText },
          { id: 'users', label: '사용자 관리', icon: Users },
          { id: 'messages', label: '메시지', icon: MessageSquare },
          { id: 'analytics', label: '분석', icon: BarChart3 },
          { id: 'settings', label: '설정', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-6 py-3 flex items-center space-x-3 hover:bg-gray-800 transition-colors ${
                activeTab === item.id
                  ? 'bg-gray-800 border-l-4 border-blue-500'
                  : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-full p-6">
        <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <LogOut className="w-5 h-5" />
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div>
      <h1 className="text-3xl font-bold mb-8">대시보드 개요</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: '총 사용자',
            value: stats.totalUsers,
            icon: Users,
            color: 'blue',
          },
          {
            label: '총 게시물',
            value: stats.totalPosts,
            icon: FileText,
            color: 'green',
          },
          {
            label: '총 메시지',
            value: stats.totalMessages,
            icon: MessageSquare,
            color: 'purple',
          },
          {
            label: '총 조회수',
            value: stats.totalViews,
            icon: Eye,
            color: 'orange',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <span className="text-sm text-gray-500">+12%</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {stat.value.toLocaleString()}
              </h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">최근 활동</h2>
        <div className="space-y-4">
          {[
            { time: '10분 전', action: '새 사용자 가입', user: 'user123' },
            { time: '30분 전', action: '블로그 포스트 작성', user: '관리자' },
            { time: '1시간 전', action: '문의 메시지 접수', user: 'guest456' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.user}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">콘텐츠 관리</h1>
        <button
          onClick={handleCreateContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>새 콘텐츠</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.views?.toLocaleString() || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewContent(item.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="보기"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditContent(item.id)}
                        className="text-green-600 hover:text-green-900"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'content':
        return renderContentManagement();
      case 'users':
        return <div>사용자 관리 페이지</div>;
      case 'messages':
        return <div>메시지 페이지</div>;
      case 'analytics':
        return <div>분석 페이지</div>;
      case 'settings':
        return <div>설정 페이지</div>;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderSidebar()}
      <div className="ml-64 p-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
