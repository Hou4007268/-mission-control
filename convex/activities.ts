import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Cron Tasks
export const listCronTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cronTasks").order("desc").collect();
  },
});

export const syncCronTasks = mutation({
  args: {
    tasks: v.array(v.object({
      jobId: v.string(),
      name: v.string(),
      schedule: v.string(),
      nextRun: v.number(),
      lastRun: v.optional(v.number()),
      status: v.string(),
      lastError: v.optional(v.string()),
      enabled: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // Delete existing tasks
    const existing = await ctx.db.query("cronTasks").collect();
    for (const task of existing) {
      await ctx.db.delete(task._id);
    }
    // Insert new tasks
    for (const task of args.tasks) {
      await ctx.db.insert("cronTasks", {
        ...task,
        updatedAt: Date.now(),
      });
    }
    return { count: args.tasks.length };
  },
});

// Activities
export const listActivities = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let activities;
    if (args.type) {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .take(args.limit || 100);
    } else {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit || 100);
    }
    return activities;
  },
});

export const addActivity = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.object({
      filePath: v.optional(v.string()),
      command: v.optional(v.string()),
      result: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Tasks
export const listTasks = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("tasks").collect();
  },
});

export const addTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.string(),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      status: "pending",
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const update: any = { status: args.status };
    if (args.status === "completed") {
      update.completedAt = Date.now();
    }
    return await ctx.db.patch(args.id, update);
  },
});

// Documents
export const searchDocuments = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_content", (q) =>
          q.search("content", args.query).eq("type", args.type)
        )
        .take(20);
    }
    return await ctx.db
      .query("documents")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query)
      )
      .take(20);
  },
});

export const addDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    path: v.string(),
    type: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      ...args,
      lastModified: Date.now(),
    });
  },
});

export const listDocuments = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("documents")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("documents").collect();
  },
});

// Stats Queries
export const getTokenStats = query({
  args: {},
  handler: async (ctx) => {
    // Hardcoded data from session-stats.md
    // In production, this would be calculated from actual session logs
    return {
      total: 93068,
      bySessionType: {
        main: 28002,
        subagent: 41752,
        cron: 23314,
      },
      byModel: [
        { name: 'kimi-k2.5', value: 45000 },
        { name: 'qwen', value: 25000 },
        { name: 'gpt-4o', value: 15068 },
        { name: 'claude', value: 8000 },
      ],
      updatedAt: Date.now(),
    };
  },
});

export const getTaskStats = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("cronTasks").collect();
    
    const stats = {
      total: tasks.length,
      success: 0,
      failed: 0,
      paused: 0,
      pending: 0,
    };

    for (const task of tasks) {
      switch (task.status) {
        case 'success':
        case 'completed':
          stats.success++;
          break;
        case 'failed':
        case 'error':
          stats.failed++;
          break;
        case 'paused':
        case 'disabled':
          stats.paused++;
          break;
        default:
          stats.pending++;
      }
    }

    return stats;
  },
});

export const getDocumentStats = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();
    
    const stats = {
      total: documents.length,
      byType: {
        memory: 0,
        note: 0,
        config: 0,
        draft: 0,
      },
      lastUpdated: 0,
    };

    for (const doc of documents) {
      // Count by type
      if (doc.type in stats.byType) {
        stats.byType[doc.type as keyof typeof stats.byType]++;
      }
      
      // Track last updated
      if (doc.lastModified > stats.lastUpdated) {
        stats.lastUpdated = doc.lastModified;
      }
    }

    return stats;
  },
});
