import React from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminUsersTabProps {
  connectionId: string | null;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ connectionId }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('chat.admin.activeUsers')}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>
            {connectionId ? '1' : '0'} {t('chat.admin.online')}
          </span>
        </div>
      </div>

      {connectionId ? (
        <div
          className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
          data-testid="active-users-list"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {t('chat.admin.anonymousUser')}
              </div>
              <div className="text-sm text-gray-500">
                <span>{t('chat.admin.connectionTime')}</span>{' '}
                {t('chat.admin.fiveMinAgo')}
                <br />
                <span>{t('chat.admin.lastActivity')}</span>{' '}
                {t('chat.admin.justNow')}
              </div>
            </div>
            <div className="ml-auto">
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                data-testid="user-status-online"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t('chat.admin.noActiveUsers')}
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
