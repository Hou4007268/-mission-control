import ActivityLog from './components/ActivityLog';
import TaskCalendar from './components/TaskCalendar';
import GlobalSearch from './components/GlobalSearch';
import TokenStats from './components/TokenStats';
import TaskStats from './components/TaskStats';
import DocumentStats from './components/DocumentStats';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-lg p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mission Control</h1>
                <p className="text-xs text-gray-500">AI 运营仪表盘</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>系统正常</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Charts Row - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {/* Token Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <TokenStats />
          </div>

          {/* Task Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <TaskStats />
          </div>

          {/* Document Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <DocumentStats />
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <ActivityLog />
          </div>
        </div>

        {/* Second Row - Calendar and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <TaskCalendar />
          </div>

          {/* Global Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <GlobalSearch />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">今日活动</p>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">定时任务</p>
            <p className="text-2xl font-bold text-green-600">8</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">待办任务</p>
            <p className="text-2xl font-bold text-orange-600">3</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">文档数量</p>
            <p className="text-2xl font-bold text-purple-600">24</p>
          </div>
        </div>
      </div>
    </main>
  );
}
