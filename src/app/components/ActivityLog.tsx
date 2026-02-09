'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';

export default function ActivityLog() {
  const [filter, setFilter] = useState<string>('all');
  const activities = useQuery(api.activities.listActivities, { limit: 50 });

  const filteredActivities = activities?.filter((a) =>
    filter === 'all' ? true : a.type === filter
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'cron':
        return 'bg-green-100 text-green-800';
      case 'message':
        return 'bg-purple-100 text-purple-800';
      case 'file_change':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'cron':
        return '⏰';
      case 'message':
        return '💬';
      case 'file_change':
        return '📝';
      default:
        return '•';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">活动记录</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="all">全部</option>
          <option value="task">任务</option>
          <option value="cron">定时任务</option>
          <option value="message">消息</option>
          <option value="file_change">文件变更</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredActivities?.map((activity) => (
          <div
            key={activity._id}
            className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
          >
            <span className="text-lg">{getTypeIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(
                    activity.type
                  )}`}
                >
                  {activity.type}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(activity.timestamp)}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-900">{activity.description}</p>
              {activity.details && (
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                  {activity.details}
                </p>
              )}
            </div>
          </div>
        ))}

        {!filteredActivities?.length && (
          <div className="py-8 text-center text-gray-500">
            <p>暂无活动记录</p>
            <p className="text-xs mt-1">系统将自动记录各项操作</p>
          </div>
        )}
      </div>
    </div>
  );
}
