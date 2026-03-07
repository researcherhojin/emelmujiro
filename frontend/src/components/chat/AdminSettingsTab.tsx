import React from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatSettings } from '../../contexts/chatHelpers';

interface AdminSettingsTabProps {
  editingSettings: ChatSettings;
  setEditingSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
  onSave: () => void;
}

const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  editingSettings,
  setEditingSettings,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('chat.admin.welcomeMessage')}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('chat.admin.maxMessageLength')}
          </label>
          <input
            type="number"
            value={editingSettings.maxMessageLength}
            onChange={(e) =>
              setEditingSettings((prev) => ({
                ...prev,
                maxMessageLength: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="100"
            max="5000"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('chat.admin.features')}
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
              {t('chat.admin.allowFileUpload')}
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
              {t('chat.admin.allowEmoji')}
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
              {t('chat.admin.soundEnabled')}
            </span>
          </label>
        </div>
      </div>

      <button
        onClick={onSave}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Save className="w-4 h-4" />
        <span>{t('chat.admin.saveSettings')}</span>
      </button>
    </div>
  );
};

export default AdminSettingsTab;
