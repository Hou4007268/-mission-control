'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';

interface CronTaskData {
  _id: string;
  jobId: string;
  name: string;
  schedule: string;
  nextRun: number;
  lastRun?: number;
  status: 'active' | 'error' | 'paused';
  lastError?: string;
  enabled: boolean;
  updatedAt: number;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  const date = new Date(timestamp);
  const hours_str = date.getHours().toString().padStart(2, '0');
  const mins_str = date.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours_str}:${mins_str}`;
  
  if (diff < 0) return '已过期';
  if (hours < 1) return `${Math.ceil(diff / (1000 * 60))}分钟后`;
  if (hours < 24) return `今天 ${timeStr}`;
  if (days === 1) return `明天 ${timeStr}`;
  if (days === 2) return `后天 ${timeStr}`;
  return `${days}天后 ${timeStr}`;
}

export default function TaskCalendar() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Fetch real cron tasks from Convex
  const cronTasks = useQuery(api.activities.listCronTasks) || [];

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    return weekDays.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  }, [currentWeek]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">任务日历</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            ← 上周
          </button>
          <span className="text-sm text-gray-600">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
          <button
            onClick={() => navigateWeek('next')}
            className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          >
            下周 →
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`rounded-lg border p-2 text-center ${
              isToday(weekDates[index])
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500">{day}</div>
            <div className="text-sm font-medium">{formatDate(weekDates[index])}</div>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">
          定时任务列表 
          <span className="text-xs text-gray-400 ml-2">
            ({cronTasks.length} 个任务)
          </span>
        </h3>
        {cronTasks.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center">
            暂无任务数据，请运行同步脚本
          </div>
        ) : (
          cronTasks.map((task: CronTaskData) => (
            <div
              key={task._id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    task.status === 'active' ? 'bg-green-500' : 
                    task.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.name}</p>
                  <p className="text-xs text-gray-500">{task.schedule}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500" title={new Date(task.nextRun).toLocaleString('zh-CN')}>
                  {formatRelativeTime(task.nextRun)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status === 'active' ? '正常' : task.status === 'error' ? '错误' : '暂停'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
