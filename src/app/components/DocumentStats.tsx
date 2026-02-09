'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';

const COLORS = {
  memory: '#3b82f6',
  note: '#10b981',
  config: '#f59e0b',
  draft: '#8b5cf6',
};

export default function DocumentStats() {
  const docStats = useQuery(api.activities.getDocumentStats);

  if (!docStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const data = [
    { name: '记忆', key: 'memory', value: docStats.byType.memory, color: COLORS.memory },
    { name: '笔记', key: 'note', value: docStats.byType.note, color: COLORS.note },
    { name: '配置', key: 'config', value: docStats.byType.config, color: COLORS.config },
    { name: '草稿', key: 'draft', value: docStats.byType.draft, color: COLORS.draft },
  ];

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '暂无';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">文档类型统计</h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-purple-600">{docStats.total}</p>
          <p className="text-xs text-gray-500">文档总数</p>
        </div>
      </div>

      {/* 柱状图 */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value) => [`${value} 个`, '数量']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-2 gap-2">
        {data.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-2 rounded-lg"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* 最近更新 */}
      <div className="pt-3 border-t border-gray-200">
        <h3 className="text-xs font-medium text-gray-500 mb-2">最近更新</h3>
        <p className="text-sm text-gray-700">
          {formatDate(docStats.lastUpdated)}
        </p>
      </div>
    </div>
  );
}
