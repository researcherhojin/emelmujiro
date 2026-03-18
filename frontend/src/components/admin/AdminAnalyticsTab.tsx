import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import logger from '../../utils/logger';
import { VisitDataPoint, PageVisitData } from '../../types';
import { api } from '../../services/api';
import { DashboardStats, ContentItem } from './types';

interface AnalyticsProps {
  stats: DashboardStats;
  contentItems: ContentItem[];
}

const PERIOD_OPTIONS = [7, 30, 90] as const;

const AdminAnalyticsTab: React.FC<AnalyticsProps> = ({ stats, contentItems }) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState(30);
  const [visitData, setVisitData] = useState<VisitDataPoint[]>([]);
  const [pageData, setPageData] = useState<PageVisitData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = useCallback(async (days: number) => {
    setAnalyticsLoading(true);
    try {
      const [visitsRes, pagesRes] = await Promise.all([
        api.getAdminVisitStats(days),
        api.getAdminPageStats(days),
      ]);
      setVisitData(visitsRes.data.data || []);
      setPageData(pagesRes.data.data || []);
    } catch (err) {
      logger.error('Failed to fetch analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [fetchAnalytics, period]);

  const sortedPosts = [...contentItems]
    .filter((item) => item.views !== undefined)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);

  const maxViews = sortedPosts.length > 0 ? sortedPosts[0].views || 1 : 1;
  const maxPageVisits = pageData.length > 0 ? pageData[0].visits || 1 : 1;

  const periodLabels: Record<number, string> = {
    7: t('admin.last7Days'),
    30: t('admin.last30Days'),
    90: t('admin.last90Days'),
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.analyticsOverview')}</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
          <p className="text-sm text-gray-500">{t('admin.totalUsers')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.totalPosts}</p>
          <p className="text-sm text-gray-500">{t('admin.totalPosts')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.totalMessages}</p>
          <p className="text-sm text-gray-500">{t('admin.totalMessages')}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.totalViews}</p>
          <p className="text-sm text-gray-500">{t('admin.totalViews')}</p>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-2 mb-6">
        {PERIOD_OPTIONS.map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === days
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {periodLabels[days]}
          </button>
        ))}
      </div>

      {/* Visit trend chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('admin.visitTrend')}</h2>
        {analyticsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : visitData.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">{t('admin.noVisitData')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={visitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => {
                  const d = new Date(value);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) => {
                  const d = new Date(String(label));
                  return d.toLocaleDateString();
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="visits"
                name={t('admin.dailyVisits')}
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="unique_visitors"
                name={t('admin.uniqueVisitors')}
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Popular pages */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('admin.popularPages')}</h2>
        {pageData.length === 0 ? (
          <p className="text-gray-500 text-sm">{t('admin.noVisitData')}</p>
        ) : (
          <div className="space-y-3">
            {pageData.map((page) => (
              <div key={page.page_path} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{page.page_path}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(page.visits / maxPageVisits) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {page.visits.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Posts by views */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">{t('admin.postsByViews')}</h2>
        {sortedPosts.length === 0 ? (
          <p className="text-gray-500 text-sm">{t('admin.noPostData')}</p>
        ) : (
          <div className="space-y-3">
            {sortedPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((post.views || 0) / maxViews) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {(post.views || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsTab;
