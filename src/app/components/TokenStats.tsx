'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function TokenStats() {
  const tokenStats = useQuery(api.activities.getTokenStats);

  if (!tokenStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const sessionData = [
    { name: 'Main', value: tokenStats.bySessionType.main, color: '#3b82f6' },
    { name: 'Subagent', value: tokenStats.bySessionType.subagent, color: '#10b981' },
    { name: 'Cron', value: tokenStats.bySessionType.cron, color: '#f59e0b' },
  ];

  const modelData = tokenStats.byModel.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
  }));

  const totalTokens = tokenStats.total;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Token 消耗统计</h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{totalTokens.toLocaleString()}</p>
          <p className="text-xs text-gray-500">总 Token 数</p>
        </div>
      </div>

      {/* 会话类型分布 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">按会话类型分布</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sessionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {sessionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${Number(value).toLocaleString()} tokens`, '']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color, fontSize: '12px' }}>
                    {value}: {entry.payload.value.toLocaleString()}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 模型分布 */}
      {modelData.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">按模型分布</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {modelData.map((entry, index) => (
                    <Cell key={`cell-model-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${Number(value).toLocaleString()} tokens`, name]}
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
          <div className="flex flex-wrap gap-2 mt-2">
            {modelData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}</span>
                <span className="text-gray-400">({item.value.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
