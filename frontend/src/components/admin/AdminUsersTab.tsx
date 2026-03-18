import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Edit,
  Trash2,
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import logger from '../../utils/logger';
import { AdminUser } from '../../types';
import { api } from '../../services/api';
import DeleteConfirmModal from './DeleteConfirmModal';

// --- Edit User Modal ---

interface EditUserModalProps {
  user: AdminUser;
  onSave: (id: number, data: Partial<AdminUser>) => void;
  onCancel: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(user.is_active);
  const [isStaff, setIsStaff] = useState(user.is_staff);

  const handleSave = () => {
    onSave(user.id, { is_active: isActive, is_staff: isStaff });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <h3 className="text-lg font-semibold mb-4">{t('admin.editUser')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.username')}
            </label>
            <p className="text-gray-900">{user.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.email')}
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('admin.activeStatus')}</label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-green-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isActive}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{t('admin.staffStatus')}</label>
            <button
              type="button"
              onClick={() => setIsStaff(!isStaff)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isStaff ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isStaff}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isStaff ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            {t('admin.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Users Tab ---

interface AdminUsersTabProps {
  onRefresh: () => void;
}

const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageSize = 20;

  const fetchUsers = useCallback(async (p: number, s: string, role: string, active: string) => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers(
        p,
        s || undefined,
        role || undefined,
        active || undefined
      );
      setUsers(res.data.results || []);
      setTotalCount(res.data.count || 0);
      setHasNextPage(res.data.next != null);
    } catch (err) {
      logger.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, search, roleFilter, activeFilter);
  }, [fetchUsers, page, roleFilter, activeFilter, search]);

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  const handleEditSave = async (id: number, data: Partial<AdminUser>) => {
    try {
      await api.updateAdminUser(id, data);
      setEditUser(null);
      fetchUsers(page, search, roleFilter, activeFilter);
      onRefresh();
    } catch (err) {
      logger.error('Failed to update user:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteUserId === null) return;
    try {
      await api.deleteAdminUser(deleteUserId);
      setDeleteUserId(null);
      fetchUsers(page, search, roleFilter, activeFilter);
      onRefresh();
    } catch (err) {
      logger.error('Failed to delete user:', err);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
    };
    const icons: Record<string, React.ReactNode> = {
      admin: <ShieldCheck className="w-3 h-3 mr-1" />,
      staff: <Shield className="w-3 h-3 mr-1" />,
      user: <UserCog className="w-3 h-3 mr-1" />,
    };
    return (
      <span
        className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${styles[role] || styles.user}`}
      >
        {icons[role]}
        {t(`admin.role${role.charAt(0).toUpperCase() + role.slice(1)}`)}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.userManagement')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.searchUsers')}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('admin.allRoles')}</option>
          <option value="admin">{t('admin.roleAdmin')}</option>
          <option value="staff">{t('admin.roleStaff')}</option>
          <option value="user">{t('admin.roleUser')}</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t('admin.allStatuses')}</option>
          <option value="true">{t('admin.active')}</option>
          <option value="false">{t('admin.inactive')}</option>
        </select>
      </div>

      {/* User count */}
      <p className="text-sm text-gray-500 mb-4">
        {t('admin.totalUsers')}: {totalCount.toLocaleString()}
      </p>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          {t('admin.noUsersFound')}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.username')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.userRole')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.tableStatus')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.joinDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.lastLogin')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('admin.tableActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      {(user.first_name || user.last_name) && (
                        <div className="text-xs text-gray-500">
                          {user.first_name} {user.last_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {t('admin.active')}
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          {t('admin.inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title={t('admin.edit')}
                          aria-label={`${t('admin.edit')} ${user.username}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!user.is_superuser && (
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title={t('admin.delete')}
                            aria-label={`${t('admin.delete')} ${user.username}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 bg-gray-50 flex items-center justify-between border-t">
              <p className="text-sm text-gray-500">
                {t('admin.pageInfo', {
                  current: page,
                  total: totalPages,
                })}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNextPage}
                  className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {editUser && (
        <EditUserModal user={editUser} onSave={handleEditSave} onCancel={() => setEditUser(null)} />
      )}
      {deleteUserId !== null && (
        <DeleteConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteUserId(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersTab;
