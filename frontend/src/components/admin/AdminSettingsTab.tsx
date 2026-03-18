import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Bell as BellIcon, Mail as MailIcon, ShieldAlert } from 'lucide-react';
import logger from '../../utils/logger';
import { api } from '../../services/api';
import { NotificationPref } from './types';

const AdminSettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState<NotificationPref | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await api.getNotificationPreferences();
        setPrefs(res.data);
      } catch (err) {
        logger.error('Failed to fetch notification preferences:', err);
      }
    };
    fetchPrefs();
  }, []);

  const handleToggle = async (key: keyof NotificationPref) => {
    if (!prefs) return;
    const newValue = !prefs[key];
    const updated = { ...prefs, [key]: newValue };
    setPrefs(updated);
    setSaving(true);
    try {
      await api.updateNotificationPreferences({ [key]: newValue });
    } catch (err) {
      logger.error('Failed to update notification preferences:', err);
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  const notifTypes: {
    key: keyof NotificationPref;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { key: 'system_enabled', label: t('admin.notifTypeSystem'), icon: BellIcon },
    { key: 'blog_enabled', label: t('admin.notifTypeBlog'), icon: FileText },
    { key: 'contact_enabled', label: t('admin.notifTypeContact'), icon: MailIcon },
    { key: 'admin_enabled', label: t('admin.notifTypeAdmin'), icon: ShieldAlert },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.settings')}</h1>

      {/* Site Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('admin.notificationSettings')}</h2>
        {prefs === null ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifTypes.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(key)}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    prefs[key] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={prefs[key]}
                  aria-label={label}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      prefs[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
            {/* Email toggle */}
            <div className="flex items-center justify-between py-2 border-t mt-4 pt-4">
              <div className="flex items-center gap-3">
                <MailIcon className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-gray-700">{t('admin.emailNotifications')}</span>
                  <p className="text-xs text-gray-400">{t('admin.emailNotificationsDesc')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('email_enabled')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  prefs.email_enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                role="switch"
                aria-checked={prefs.email_enabled}
                aria-label={t('admin.emailNotifications')}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    prefs.email_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsTab;
