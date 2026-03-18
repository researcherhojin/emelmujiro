import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, FileText, MessageSquare, Eye } from 'lucide-react';
import { DashboardStats } from './types';

interface OverviewProps {
  stats: DashboardStats;
}

const AdminOverviewTab: React.FC<OverviewProps> = ({ stats }) => {
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

export default AdminOverviewTab;
