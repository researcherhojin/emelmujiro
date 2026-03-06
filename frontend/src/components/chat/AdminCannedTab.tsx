import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChatSettings } from '../../contexts/chatHelpers';

interface AdminCannedTabProps {
  editingSettings: ChatSettings;
  setEditingSettings: React.Dispatch<React.SetStateAction<ChatSettings>>;
}

const AdminCannedTab: React.FC<AdminCannedTabProps> = ({
  editingSettings,
  setEditingSettings,
}) => {
  const { t } = useTranslation();
  const [newCannedResponse, setNewCannedResponse] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (newCannedResponse.trim()) {
      setEditingSettings((prev) => ({
        ...prev,
        cannedResponses: [...prev.cannedResponses, newCannedResponse.trim()],
      }));
      setNewCannedResponse('');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(editingSettings.cannedResponses[index]);
  };

  const handleSave = () => {
    if (editingIndex !== null && editingValue.trim()) {
      setEditingSettings((prev) => ({
        ...prev,
        cannedResponses: prev.cannedResponses.map((response, i) =>
          i === editingIndex ? editingValue.trim() : response
        ),
      }));
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleDelete = (index: number) => {
    setEditingSettings((prev) => ({
      ...prev,
      cannedResponses: prev.cannedResponses.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {t('chat.admin.cannedResponses', '자동 응답 관리')}
        </h3>
      </div>

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
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={!newCannedResponse.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('chat.admin.add', '추가')}</span>
        </button>
      </div>

      <div className="space-y-2">
        {editingSettings.cannedResponses.map((response, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                />
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-700 p-1"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingIndex(null);
                    setEditingValue('');
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
                  onClick={() => handleEdit(index)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
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
  );
};

export default AdminCannedTab;
