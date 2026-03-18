import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-react';
import logger from '../../utils/logger';
import { api, blogService } from '../../services/api';

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

// --- Sub-components ---

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const tabs = [
    { id: 'overview', label: t('admin.overview'), icon: LayoutDashboard },
    { id: 'content', label: t('admin.contentManagement'), icon: FileText },
    { id: 'users', label: t('admin.userManagement'), icon: Users },
    { id: 'messages', label: t('admin.messages'), icon: MessageSquare },
    { id: 'analytics', label: t('admin.analytics'), icon: BarChart3 },
    { id: 'settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold">{t('admin.dashboard')}</h2>
      </div>
      <nav className="mt-6">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full px-6 py-3 flex items-center space-x-3 hover:bg-gray-800 transition-colors ${
                activeTab === item.id ? 'bg-gray-800 border-l-4 border-blue-500' : ''
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
};

interface OverviewProps {
  stats: DashboardStats;
}

const AdminOverview: React.FC<OverviewProps> = ({ stats }) => {
  const { t } = useTranslation();
  const statCards = [
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
  ];

  const recentActivity = [
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
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.dashboardOverview')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgClass} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textClass}`} />
                </div>
                <span className="text-sm text-gray-500">+12%</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value.toLocaleString()}</h3>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('admin.recentActivity')}</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
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
};

interface ContentTableProps {
  items: ContentItem[];
  onCreate: () => void;
  onView: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
}

const AdminContentTable: React.FC<ContentTableProps> = ({
  items,
  onCreate,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('admin.contentManagement')}</h1>
        <button
          onClick={onCreate}
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
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
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
                        onClick={() => onView(item.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title={t('admin.view')}
                        aria-label={`${t('admin.view')} ${item.title}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item.id)}
                        className="text-green-600 hover:text-green-900"
                        title={t('admin.edit')}
                        aria-label={`${t('admin.edit')} ${item.title}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
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
};

interface DeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteModalProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <p className="text-gray-800 mb-4">{t('admin.confirmDelete')}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Messages Tab ---

interface AdminMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  inquiry_type: string;
  is_processed: boolean;
  created_at: string;
}

interface MessagesProps {
  onRefresh: () => void;
}

const AdminMessages: React.FC<MessagesProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.getAdminMessages();
        setMessages(res.data.results || []);
      } catch (err) {
        logger.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleMarkProcessed = async (id: string) => {
    try {
      await api.updateAdminMessage(id, { is_processed: true });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_processed: true } : m)));
      onRefresh();
    } catch (err) {
      logger.error('Failed to update message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.messages')}</h1>
      {messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          {t('admin.messagesEmpty')}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.tableDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.messageName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.messageSubject')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.messageType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.tableStatus')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.tableActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {msg.created_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{msg.name}</div>
                      <div className="text-xs text-gray-500">{msg.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {msg.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {msg.inquiry_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {msg.is_processed ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('admin.processed')}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          {t('admin.unprocessed')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!msg.is_processed && (
                        <button
                          onClick={() => handleMarkProcessed(msg.id)}
                          className="text-green-600 hover:text-green-900 text-xs font-medium"
                        >
                          {t('admin.markProcessed')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Analytics Tab ---

interface AnalyticsProps {
  stats: DashboardStats;
  contentItems: ContentItem[];
}

const AdminAnalytics: React.FC<AnalyticsProps> = ({ stats, contentItems }) => {
  const { t } = useTranslation();
  const sortedPosts = [...contentItems]
    .filter((item) => item.views !== undefined)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const maxViews = sortedPosts.length > 0 ? sortedPosts[0].views || 1 : 1;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.analyticsOverview')}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500">{t('admin.totalUsers')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalPosts}</p>
          <p className="text-sm text-gray-500">{t('admin.totalPosts')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.totalMessages}</p>
          <p className="text-sm text-gray-500">{t('admin.totalMessages')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.totalViews}</p>
          <p className="text-sm text-gray-500">{t('admin.totalViews')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('admin.postsByViews')}</h2>
        {sortedPosts.length === 0 ? (
          <p className="text-gray-500 text-sm">{t('admin.noPostData')}</p>
        ) : (
          <div className="space-y-3">
            {sortedPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((post.views || 0) / maxViews) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {(post.views || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Users Tab (stub) ---

const AdminUsersTab: React.FC<{ totalUsers: number }> = ({ totalUsers }) => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.userManagement')}</h1>
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-semibold text-gray-900 mb-2">
          {totalUsers.toLocaleString()} {t('admin.totalUsers')}
        </p>
        <p className="text-gray-500">{t('admin.userManagementComingSoon')}</p>
      </div>
    </div>
  );
};

// --- Settings Tab (stub) ---

const AdminSettingsTab: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.settings')}</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('admin.siteInfo')}</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">{t('admin.siteUrl')}</span>
            <span className="text-gray-900 font-medium">emelmujiro.com</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">{t('admin.apiUrl')}</span>
            <span className="text-gray-900 font-medium">api.emelmujiro.com</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">{t('admin.appVersion')}</span>
            <span className="text-gray-900 font-medium">1.0.0</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">{t('admin.settingsReadOnly')}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main component ---

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { localizedNavigate } = useLocalizedPath();
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, contentRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminContent(),
      ]);
      setStats(statsRes.data);
      setContentItems(contentRes.data);
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

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await blogService.deletePost(deleteConfirmId);
      } catch (err) {
        logger.error('Failed to delete content:', err);
      }
      setContentItems(contentItems.filter((item) => item.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

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
        return <AdminOverview stats={stats} />;
      case 'content':
        return (
          <AdminContentTable
            items={contentItems}
            onCreate={() => localizedNavigate('/blog/new')}
            onView={(id) => localizedNavigate(`/blog/${id}`)}
            onEdit={(id) => localizedNavigate(`/blog/${id}`)}
            onDelete={(id) => setDeleteConfirmId(id)}
          />
        );
      case 'users':
        return <AdminUsersTab totalUsers={stats.totalUsers} />;
      case 'messages':
        return <AdminMessages onRefresh={fetchDashboardData} />;
      case 'analytics':
        return <AdminAnalytics stats={stats} contentItems={contentItems} />;
      case 'settings':
        return <AdminSettingsTab />;
      default:
        return <AdminOverview stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-64 p-8">
        <div className="mb-6" />
        {renderContent()}
      </div>

      {deleteConfirmId !== null && (
        <DeleteConfirmModal onConfirm={confirmDelete} onCancel={() => setDeleteConfirmId(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;
