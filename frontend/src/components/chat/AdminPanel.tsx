import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, MessageSquare, Users, BarChart3, X } from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useUI } from '../../contexts/UIContext';
import { useTranslation } from 'react-i18next';
import AdminSettingsTab from './AdminSettingsTab';
import AdminCannedTab from './AdminCannedTab';
import AdminStatsTab from './AdminStatsTab';
import AdminUsersTab from './AdminUsersTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showNotification } = useUI();
  const { settings, messages, businessHours, connectionId } = useChatContext();

  const [activeTab, setActiveTab] = useState<
    'settings' | 'canned' | 'stats' | 'users'
  >('settings');
  const [editingSettings, setEditingSettings] = useState(settings);

  const tabs = [
    { id: 'settings', label: t('chat.admin.settings', '설정'), icon: Settings },
    {
      id: 'canned',
      label: t('chat.admin.cannedResponses', '자동 응답'),
      icon: MessageSquare,
    },
    { id: 'stats', label: t('chat.admin.statistics', '통계'), icon: BarChart3 },
    { id: 'users', label: t('chat.admin.users', '사용자'), icon: Users },
  ] as const;

  const handleSaveSettings = () => {
    try {
      localStorage.setItem(
        'chat-admin-settings',
        JSON.stringify(editingSettings)
      );
      showNotification(
        'success',
        t('chat.admin.settingsSaved', '설정이 저장되었습니다.')
      );
    } catch {
      showNotification(
        'error',
        t('chat.admin.settingsSaveFailed', '설정 저장에 실패했습니다.')
      );
    }
  };

  const getChatStatistics = () => {
    const totalMessages = messages.length;
    const userMessages = messages.filter((m) => m.sender === 'user').length;

    return {
      totalMessages,
      userMessages,
      averageResponseTime: '2.3분',
      satisfactionRating: '4.7/5',
    };
  };

  const stats = getChatStatistics();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-label="관리자 패널"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('chat.admin.title', '채팅 관리자 패널')}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              {connectionId && (
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{t('chat.admin.connected', '연결됨')}</span>
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b border-gray-200 dark:border-gray-700"
          role="tablist"
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'settings' && (
            <AdminSettingsTab
              editingSettings={editingSettings}
              setEditingSettings={setEditingSettings}
              onSave={handleSaveSettings}
            />
          )}
          {activeTab === 'canned' && (
            <AdminCannedTab
              editingSettings={editingSettings}
              setEditingSettings={setEditingSettings}
            />
          )}
          {activeTab === 'stats' && (
            <AdminStatsTab stats={stats} businessHours={businessHours} />
          )}
          {activeTab === 'users' && (
            <AdminUsersTab connectionId={connectionId} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;
