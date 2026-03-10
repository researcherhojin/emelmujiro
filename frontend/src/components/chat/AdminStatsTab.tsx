import React from 'react';
import { MessageSquare, User, Clock, BarChart3, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChatStats {
  totalMessages: number;
  userMessages: number;
  averageResponseTime: string;
  satisfactionRating: string;
}

interface BusinessHours {
  isOpen: boolean;
  hours: string;
}

interface AdminStatsTabProps {
  stats: ChatStats;
  businessHours: BusinessHours;
}

const AdminStatsTab: React.FC<AdminStatsTabProps> = ({ stats, businessHours }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('chat.admin.statistics')}
        </h3>
        <button
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          aria-label={t('chat.admin.refreshStats')}
          role="button"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('chat.admin.refresh')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-600" data-testid="total-messages-count">
                {stats.totalMessages}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('chat.admin.totalMessages')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600" data-testid="active-users-count">
                {stats.userMessages}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('chat.admin.userMessages')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-purple-600" data-testid="avg-response-time">
                {stats.averageResponseTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('chat.admin.avgResponseTime')}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-2xl font-bold text-amber-600" data-testid="satisfaction-rate">
                {stats.satisfactionRating}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('chat.admin.satisfaction')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {t('chat.admin.businessHours')}
        </h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${businessHours.isOpen ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-gray-600 dark:text-gray-400">
              {businessHours.isOpen
                ? t('chat.admin.currentlyOpen')
                : t('chat.admin.currentlyClosed')}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">{businessHours.hours}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsTab;
