import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalMessages: 0,
    totalViews: 0,
  });
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<
    string | number | null
  >(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
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
          title: t('admin.mock.post1Title'),
          type: 'blog',
          status: 'published',
          author: t('admin.administrator'),
          createdAt: '2024-01-15',
          views: 1234,
        },
        {
          id: 2,
          title: t('admin.mock.post2Title'),
          type: 'page',
          status: 'draft',
          author: t('admin.administrator'),
          createdAt: '2024-01-14',
          views: 567,
        },
      ]);
    } catch (err) {
      logger.error('Failed to fetch dashboard data:', err);
      setError(t('admin.fetchError'));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateContent = () => {
    // TODO: navigate to content creation page when backend is deployed
    logger.info('handleCreateContent: not yet implemented');
  };

  const handleEditContent = (id: string | number) => {
    // TODO: navigate to content edit page when backend is deployed
    logger.info(`handleEditContent: id=${id}, not yet implemented`);
  };

  const handleDeleteContent = (id: string | number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      setContentItems(
        contentItems.filter((item) => item.id !== deleteConfirmId)
      );
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleViewContent = (id: string | number) => {
    // TODO: navigate to content view page when backend is deployed
    logger.info(`handleViewContent: id=${id}, not yet implemented`);
  };

  const renderSidebar = () => (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold">{t('admin.dashboard')}</h2>
      </div>
      <nav className="mt-6">
        {[
          { id: 'overview', label: t('admin.overview'), icon: LayoutDashboard },
          {
            id: 'content',
            label: t('admin.contentManagement'),
            icon: FileText,
          },
          { id: 'users', label: t('admin.userManagement'), icon: Users },
          { id: 'messages', label: t('admin.messages'), icon: MessageSquare },
          { id: 'analytics', label: t('admin.analytics'), icon: BarChart3 },
          { id: 'settings', label: t('admin.settings'), icon: Settings },
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
          <span>{t('admin.logout')}</span>
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {t('admin.dashboardOverview')}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: t('admin.totalUsers'),
            value: stats.totalUsers,
            icon: Users,
            bgClass: 'bg-blue-100',
            textClass: 'text-blue-600',
          },
          {
            label: t('admin.totalPosts'),
            value: stats.totalPosts,
            icon: FileText,
            bgClass: 'bg-green-100',
            textClass: 'text-green-600',
          },
          {
            label: t('admin.totalMessages'),
            value: stats.totalMessages,
            icon: MessageSquare,
            bgClass: 'bg-purple-100',
            textClass: 'text-purple-600',
          },
          {
            label: t('admin.totalViews'),
            value: stats.totalViews,
            icon: Eye,
            bgClass: 'bg-orange-100',
            textClass: 'text-orange-600',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgClass} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textClass}`} />
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
        <h2 className="text-xl font-semibold mb-4">
          {t('admin.recentActivity')}
        </h2>
        <div className="space-y-4">
          {[
            {
              time: t('admin.tenMinAgo'),
              action: t('admin.newUserSignup'),
              user: 'user123',
            },
            {
              time: t('admin.thirtyMinAgo'),
              action: t('admin.blogPostCreated'),
              user: t('admin.administrator'),
            },
            {
              time: t('admin.oneHourAgo'),
              action: t('admin.inquiryReceived'),
              user: 'guest456',
            },
          ].map((activity) => (
            <div
              key={`${activity.action}-${activity.time}`}
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
        <h1 className="text-3xl font-bold">{t('admin.contentManagement')}</h1>
        <button
          onClick={handleCreateContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t('admin.newContent')}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.tableTitle')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.tableType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.tableStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.tableAuthor')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.tableViews')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.tableDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.tableActions')}
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
                        title={t('admin.view')}
                        aria-label={`${t('admin.view')} ${item.title}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditContent(item.id)}
                        className="text-green-600 hover:text-green-900"
                        title={t('admin.edit')}
                        aria-label={`${t('admin.edit')} ${item.title}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title={t('admin.delete')}
                        aria-label={`${t('admin.delete')} ${item.title}`}
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

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('error.retry')}
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'content':
        return renderContentManagement();
      case 'users':
        return <div>{t('admin.userManagementPage')}</div>;
      case 'messages':
        return <div>{t('admin.messagesPage')}</div>;
      case 'analytics':
        return <div>{t('admin.analyticsPage')}</div>;
      case 'settings':
        return <div>{t('admin.settingsPage')}</div>;
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
            <button
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
        {renderContent()}
      </div>

      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <p className="text-gray-800 mb-4">{t('admin.confirmDelete')}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
