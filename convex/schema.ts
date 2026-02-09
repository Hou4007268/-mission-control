import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cronTasks: defineTable({
    jobId: v.string(),
    name: v.string(),
    schedule: v.string(),
    nextRun: v.number(),
    lastRun: v.optional(v.number()),
    status: v.string(),
    lastError: v.optional(v.string()),
    enabled: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_status", ["status"]),

  activities: defineTable({
    type: v.string(), // 'task', 'cron', 'message', 'file_change'
    description: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.object({
      filePath: v.optional(v.string()),
      command: v.optional(v.string()),
      result: v.optional(v.string()),
    })),
    timestamp: v.number(), // Unix timestamp
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // 'pending', 'in_progress', 'completed', 'cancelled'
    priority: v.string(), // 'low', 'medium', 'high'
    dueDate: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_status", ["status"])
    .index("by_dueDate", ["dueDate"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    path: v.string(),
    type: v.string(), // 'memory', 'note', 'draft', 'config'
    lastModified: v.number(),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_path", ["path"])
    .index("by_type", ["type"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["type", "tags"],
    }),
});
