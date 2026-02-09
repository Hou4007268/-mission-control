'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'tasks'>('all');

  const documents = useQuery(api.activities.searchDocuments, 
    query.length > 2 ? { query } : { query: '' }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is automatic via useQuery
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">全局搜索</h2>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索记忆、文档、任务..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-blue-500 focus:outline-none"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </form>

      <div className="flex gap-2">
        {(['all', 'documents', 'tasks'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              activeTab === tab
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === 'all' ? '全部' : tab === 'documents' ? '文档' : '任务'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {query.length <= 2 && (
          <div className="py-8 text-center text-gray-500">
            <p className="text-4xl mb-2">🔍</p>
            <p>输入关键词开始搜索</p>
            <p className="text-xs mt-1">至少输入3个字符</p>
          </div>
        )}

        {documents?.map((doc) => (
          <div
            key={doc._id}
            className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {doc.type === 'memory' ? '🧠' : doc.type === 'note' ? '📝' : '📄'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.title}
                </p>
                <p className="text-xs text-gray-500">
                  {doc.path} • {formatDate(doc.lastModified)}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  doc.type === 'memory'
                    ? 'bg-purple-100 text-purple-800'
                    : doc.type === 'note'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {doc.type}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-600 line-clamp-2">
              {doc.content.substring(0, 200)}...
            </p>
          </div>
        ))}

        {query.length > 2 && !documents?.length && (
          <div className="py-8 text-center text-gray-500">
            <p>未找到相关结果</p>
            <p className="text-xs mt-1">尝试其他关键词</p>
          </div>
        )}
      </div>
    </div>
  );
}
