import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react';

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

export default AdminSidebar;
