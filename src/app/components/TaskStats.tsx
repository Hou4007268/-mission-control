'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';

const COLORS = {
  success: '#10b981',
  failed: '#ef4444',
  paused: '#f59e0b',
  pending: '#6b7280',
};

export default function TaskStats() {
  const taskStats = useQuery(api.activities.getTaskStats);

  if (!taskStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const data = [
    { name: '成功', value: taskStats.success, color: COLORS.success },
    { name: '失败', value: taskStats.failed, color: COLORS.failed },
    { name: '暂停', value: taskStats.paused, color: COLORS.paused },
    { name: '待执行', value: taskStats.pending, color: COLORS.pending },
  ].filter(item => item.value > 0);

  const successRate = taskStats.total > 0
    ? Math.round((taskStats.success / taskStats.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">任务执行统计</h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">{taskStats.total}</p>
          <p className="text-xs text-gray-500">任务总数</p>
        </div>
      </div>

      {/* 成功率 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">成功率</span>
          <span className={`text-lg font-bold ${successRate >= 80 ? 'text-green-600' : successRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {successRate}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              successRate >= 80 ? 'bg-green-500' : successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* 饼图 */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} 个`, name]}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 图例和详情 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">成功</span>
          </div>
          <span className="text-sm font-semibold text-green-700">{taskStats.success}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-700">失败</span>
          </div>
          <span className="text-sm font-semibold text-red-700">{taskStats.failed}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-700">暂停</span>
          </div>
          <span className="text-sm font-semibold text-yellow-700">{taskStats.paused}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-sm text-gray-700">待执行</span>
          </div>
          <span className="text-sm font-semibold text-gray-700">{taskStats.pending}</span>
        </div>
      </div>
    </div>
  );
}
