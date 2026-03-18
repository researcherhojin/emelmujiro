import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';
import logger from '../../utils/logger';
import NotificationBell from '../common/NotificationBell';
import { api, blogService } from '../../services/api';
import { DashboardStats, ContentItem } from './types';
import AdminSidebar from './AdminSidebar';
import AdminOverviewTab from './AdminOverviewTab';
import AdminContentTab from './AdminContentTab';
import AdminMessagesTab from './AdminMessagesTab';
import AdminAnalyticsTab from './AdminAnalyticsTab';
import AdminUsersTab from './AdminUsersTab';
import AdminSettingsTab from './AdminSettingsTab';
import DeleteConfirmModal from './DeleteConfirmModal';

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
        return <AdminOverviewTab stats={stats} />;
      case 'content':
        return (
          <AdminContentTab
            items={contentItems}
            onCreate={() => localizedNavigate('/blog/new')}
            onView={(id) => localizedNavigate(`/blog/${id}`)}
            onEdit={(id) => localizedNavigate(`/blog/${id}`)}
            onDelete={(id) => setDeleteConfirmId(id)}
          />
        );
      case 'users':
        return <AdminUsersTab onRefresh={fetchDashboardData} />;
      case 'messages':
        return <AdminMessagesTab onRefresh={fetchDashboardData} />;
      case 'analytics':
        return <AdminAnalyticsTab stats={stats} contentItems={contentItems} />;
      case 'settings':
        return <AdminSettingsTab />;
      default:
        return <AdminOverviewTab stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-64 p-8">
        <div className="mb-6 flex justify-end">
          <NotificationBell />
        </div>
        {renderContent()}
      </div>

      {deleteConfirmId !== null && (
        <DeleteConfirmModal onConfirm={confirmDelete} onCancel={() => setDeleteConfirmId(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;
