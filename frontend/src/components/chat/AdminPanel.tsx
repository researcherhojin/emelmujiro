import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  MessageSquare,
  User,
  Clock,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Users,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { useChatContext } from '../../contexts/ChatContext';
import { useUI } from '../../contexts/UIContext';
import { useTranslation } from 'react-i18next';

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
  const [newCannedResponse, setNewCannedResponse] = useState('');
  const [editingCannedIndex, setEditingCannedIndex] = useState<number | null>(
    null
  );
  const [editingCannedValue, setEditingCannedValue] = useState('');

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
      // In a real app, this would save to backend
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

  const handleAddCannedResponse = () => {
    if (newCannedResponse.trim()) {
      setEditingSettings((prev) => ({
        ...prev,
        cannedResponses: [...prev.cannedResponses, newCannedResponse.trim()],
      }));
      setNewCannedResponse('');
    }
  };

  const handleEditCannedResponse = (index: number) => {
    setEditingCannedIndex(index);
    setEditingCannedValue(editingSettings.cannedResponses[index]);
  };

  const handleSaveCannedResponse = () => {
    if (editingCannedIndex !== null && editingCannedValue.trim()) {
      setEditingSettings((prev) => ({
        ...prev,
        cannedResponses: prev.cannedResponses.map((response, index) =>
          index === editingCannedIndex ? editingCannedValue.trim() : response
        ),
      }));
      setEditingCannedIndex(null);
      setEditingCannedValue('');
    }
  };

  const handleDeleteCannedResponse = (index: number) => {
    setEditingSettings((prev) => ({
      ...prev,
      cannedResponses: prev.cannedResponses.filter((_, i) => i !== index),
    }));
  };

  const getChatStatistics = () => {
    const totalMessages = messages.length;
    const userMessages = messages.filter((m) => m.sender === 'user').length;
    const agentMessages = messages.filter((m) => m.sender === 'agent').length;
    const systemMessages = messages.filter((m) => m.sender === 'system').length;

    const today = new Date().toDateString();
    const todayMessages = messages.filter(
      (m) => m.timestamp.toDateString() === today
    ).length;

    return {
      totalMessages,
      userMessages,
      agentMessages,
      systemMessages,
      todayMessages,
      averageResponseTime: '2.3분', // Mock data
      satisfactionRating: '4.7/5', // Mock data
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
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Welcome Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('chat.admin.welcomeMessage', '환영 메시지')}
                  </label>
                  <textarea
                    value={editingSettings.welcomeMessage}
                    onChange={(e) =>
                      setEditingSettings((prev) => ({
                        ...prev,
                        welcomeMessage: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                {/* Max Message Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('chat.admin.maxMessageLength', '최대 메시지 길이')}
                  </label>
                  <input
                    type="number"
                    value={editingSettings.maxMessageLength}
                    onChange={(e) =>
                      setEditingSettings((prev) => ({
                        ...prev,
                        maxMessageLength: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="100"
                    max="5000"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('chat.admin.features', '기능 설정')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editingSettings.allowFileUpload}
                      onChange={(e) =>
                        setEditingSettings((prev) => ({
                          ...prev,
                          allowFileUpload: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('chat.admin.allowFileUpload', '파일 업로드 허용')}
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editingSettings.allowEmoji}
                      onChange={(e) =>
                        setEditingSettings((prev) => ({
                          ...prev,
                          allowEmoji: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('chat.admin.allowEmoji', '이모지 사용 허용')}
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editingSettings.soundEnabled}
                      onChange={(e) =>
                        setEditingSettings((prev) => ({
                          ...prev,
                          soundEnabled: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('chat.admin.soundEnabled', '알림음 활성화')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{t('chat.admin.saveSettings', '설정 저장')}</span>
              </button>
            </div>
          )}

          {/* Canned Responses Tab */}
          {activeTab === 'canned' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('chat.admin.cannedResponses', '자동 응답 관리')}
                </h3>
              </div>

              {/* Add New Response */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCannedResponse}
                  onChange={(e) => setNewCannedResponse(e.target.value)}
                  placeholder={t(
                    'chat.admin.addCannedResponse',
                    '새 자동 응답 추가...'
                  )}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleAddCannedResponse()
                  }
                />
                <button
                  onClick={handleAddCannedResponse}
                  disabled={!newCannedResponse.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('chat.admin.add', '추가')}</span>
                </button>
              </div>

              {/* Existing Responses */}
              <div className="space-y-2">
                {editingSettings.cannedResponses.map((response, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {editingCannedIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingCannedValue}
                          onChange={(e) =>
                            setEditingCannedValue(e.target.value)
                          }
                          className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                          onKeyPress={(e) =>
                            e.key === 'Enter' && handleSaveCannedResponse()
                          }
                        />
                        <button
                          onClick={handleSaveCannedResponse}
                          className="text-green-600 hover:text-green-700 p-1"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCannedIndex(null);
                            setEditingCannedValue('');
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-gray-900 dark:text-white">
                          {response}
                        </span>
                        <button
                          onClick={() => handleEditCannedResponse(index)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCannedResponse(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('chat.admin.statistics', '채팅 통계')}
                </h3>
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('chat.admin.refresh', '새로고침')}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.totalMessages}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('chat.admin.totalMessages', '총 메시지')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.userMessages}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('chat.admin.userMessages', '사용자 메시지')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.averageResponseTime}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('chat.admin.avgResponseTime', '평균 응답시간')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="text-2xl font-bold text-amber-600">
                        {stats.satisfactionRating}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('chat.admin.satisfaction', '만족도')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours Status */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {t('chat.admin.businessHours', '운영 현황')}
                </h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${businessHours.isOpen ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      {businessHours.isOpen
                        ? t('chat.admin.currentlyOpen', '현재 운영 중')
                        : t('chat.admin.currentlyClosed', '현재 운영 종료')}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {businessHours.hours}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('chat.admin.activeUsers', '활성 사용자')}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>
                    {connectionId ? '1' : '0'}{' '}
                    {t('chat.admin.online', '온라인')}
                  </span>
                </div>
              </div>

              {connectionId ? (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      U
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('chat.admin.anonymousUser', '익명 사용자')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('chat.admin.connectionId', '연결 ID')}:{' '}
                        {connectionId.slice(0, 8)}...
                      </div>
                    </div>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t(
                    'chat.admin.noActiveUsers',
                    '현재 활성 사용자가 없습니다.'
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;
