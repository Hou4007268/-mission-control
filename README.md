# Mission Control - AI Operations Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-Realtime-orange)](https://convex.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-blue)](https://tailwindcss.com/)

> 🎛️ 专为AI自动化运营打造的轻量级驾驶舱面板

Mission Control 是一个专为 OpenClaw/AI 工作流设计的可视化仪表盘。它将分散的AI运营数据整合到一个实时看板中，让你对AI的"所思所想所做"一目了然。

![Dashboard Preview](./docs/preview.png)

## ✨ 核心特性

### 📊 运营数据可视化
- **Token消耗追踪** - 实时监控各会话类型消耗（main/subagent/cron）
- **任务执行看板** - 10+ Cron任务状态实时同步，成功率一目了然
- **文档类型统计** - 记忆文件、笔记、配置分类展示

### 🗓️ 任务日历系统
- 周视图/日视图切换
- 相对时间显示（"明天10:20"、"3天后"）
- 状态指示（✓正常/✗错误/⏸暂停）

### 🔍 全局搜索
- 全文搜索记忆文件
- 按类型筛选（memory/note/config）
- 实时高亮匹配内容

### 📈 实时数据流
- Convex 实时数据库同步
- 无需刷新，数据自动更新
- WebSocket 长连接保持

## 🚀 快速开始

### 前置要求
- Node.js 18+
- OpenClaw CLI (`npm install -g @openclaw/cli`)
- Convex 账号（免费）

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/mission-control.git
cd mission-control

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 Convex URL

# 启动开发服务器
npm run dev
```

### 数据同步

```bash
# 同步记忆文件到数据库
npm run import-docs

# 同步 Cron 任务到数据库
npm run sync-cron
```

## 🏗️ 技术架构

```
mission-control/
├── src/
│   ├── app/
│   │   ├── components/          # React 组件
│   │   │   ├── TokenStats.tsx   # Token 消耗饼图
│   │   │   ├── TaskStats.tsx    # 任务状态统计
│   │   │   ├── DocumentStats.tsx # 文档类型柱状图
│   │   │   ├── TaskCalendar.tsx  # 任务日历
│   │   │   ├── ActivityLog.tsx   # 活动日志
│   │   │   └── GlobalSearch.tsx  # 全局搜索
│   │   └── page.tsx             # 主页面
│   └── ...
├── convex/
│   ├── schema.ts                # 数据库Schema
│   └── activities.ts            # 查询与Mutation
├── scripts/
│   ├── import-documents.ts      # 文档导入脚本
│   └── sync-cron-tasks.ts       # Cron同步脚本
└── package.json
```

### 技术栈
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend**: Convex (Serverless Database)
- **Visualization**: Recharts
- **AI Integration**: OpenClaw

## 📸 功能展示

### Token 消耗统计
![Token Stats](./docs/token-stats.png)

### 任务日历
![Task Calendar](./docs/task-calendar.png)

### 全局搜索
![Global Search](./docs/global-search.png)

## 🎯 适用场景

| 场景 | 痛点 | 解决方案 |
|------|------|----------|
| AI运营 | 不知道AI在干什么 | 实时活动日志 |
| 自动化 | Cron任务散落各处 | 统一任务日历 |
| 成本管控 | Token消耗不透明 | 消耗分布图表 |
| 记忆管理 | 文件太多难查找 | 全文搜索+分类 |

## 🛠️ 自定义配置

### 添加新的数据源

在 `convex/activities.ts` 中添加：

```typescript
export const listCustomData = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("yourTable").collect();
  },
});
```

### 创建新的图表组件

```typescript
// src/app/components/YourChart.tsx
'use client';
import { useQuery } from 'convex/react';
import { api } from '@convex/api';
import { PieChart, Pie, Cell } from 'recharts';

export default function YourChart() {
  const data = useQuery(api.activities.yourQuery);
  // ... 图表实现
}
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 🙏 致谢

- [OpenClaw](https://github.com/moltbot/moltbot) - AI自动化框架
- [Convex](https://convex.dev/) - 实时数据库
- [Next.js](https://nextjs.org/) - React框架
- [Recharts](https://recharts.org/) - 图表库

## 💬 讨论

有任何问题或建议？欢迎通过以下方式联系：
- GitHub Issues
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

---

**如果这个项目帮到了你，请给个 ⭐ Star 支持一下！**
