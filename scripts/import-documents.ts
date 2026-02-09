/**
 * Import Documents Script
 * 
 * Syncs markdown files from workspace to Convex database.
 * Usage: npx ts-node scripts/import-documents.ts
 */

import { ConvexClient } from "convex/browser";
import * as fs from "fs";
import * as path from "path";

// Configuration
const WORKSPACE_ROOT = "C:\\Users\\Administrator\\.openclaw\\workspace";
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "http://127.0.0.1:3210";

// File type mapping
const FILE_TYPES = {
  // Memory files
  memory: ["memory/", "MEMORY.md"],
  // Note files  
  note: ["notes/", "skills/"],
  // Config files
  config: ["AGENTS.md", "USER.md", "SOUL.md", "IDENTITY.md", "TOOLS.md", "BOOTSTRAP.md", "HEARTBEAT.md", "ONBOARDING.md"],
  // Draft files
  draft: ["notes/drafts/"],
};

interface ImportStats {
  total: number;
  success: number;
  failed: number;
  errors: Array<{ path: string; error: string }>;
}

interface DocumentData {
  title: string;
  content: string;
  path: string;
  type: string;
  tags: string[];
}

/**
 * Determine file type based on path
 */
function getFileType(filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, "/");
  
  // Check each type
  for (const [type, patterns] of Object.entries(FILE_TYPES)) {
    for (const pattern of patterns) {
      if (normalizedPath.includes(pattern) || path.basename(normalizedPath) === pattern) {
        return type;
      }
    }
  }
  
  // Default to note
  return "note";
}

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterText = match[1];
  const body = content.slice(match[0].length);
  const frontmatter: Record<string, any> = {};
  
  // Simple YAML parsing for key: value pairs
  const lines = frontmatterText.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }
  
  return { frontmatter, body };
}

/**
 * Extract title from content or filename
 */
function extractTitle(filePath: string, content: string, frontmatter: Record<string, any>): string {
  // Check frontmatter first
  if (frontmatter.title) {
    return frontmatter.title;
  }
  
  // Look for first heading
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  
  // Use filename without extension
  return path.basename(filePath, ".md");
}

/**
 * Get all markdown files to import
 */
function getMarkdownFiles(): string[] {
  const files: string[] = [];
  
  // Memory files
  const memoryDir = path.join(WORKSPACE_ROOT, "memory");
  if (fs.existsSync(memoryDir)) {
    const memoryFiles = fs.readdirSync(memoryDir)
      .filter(f => f.endsWith(".md"))
      .map(f => path.join(memoryDir, f));
    files.push(...memoryFiles);
  }
  
  // MEMORY.md in root
  const memoryFile = path.join(WORKSPACE_ROOT, "MEMORY.md");
  if (fs.existsSync(memoryFile)) {
    files.push(memoryFile);
  }
  
  // Notes files
  const notesDir = path.join(WORKSPACE_ROOT, "notes");
  if (fs.existsSync(notesDir)) {
    const getAllMdFiles = (dir: string): string[] => {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...getAllMdFiles(fullPath));
        } else if (entry.name.endsWith(".md")) {
          results.push(fullPath);
        }
      }
      return results;
    };
    files.push(...getAllMdFiles(notesDir));
  }
  
  // Skills files
  const skillsDir = path.join(WORKSPACE_ROOT, "skills");
  if (fs.existsSync(skillsDir)) {
    const getSkillMdFiles = (dir: string): string[] => {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...getSkillMdFiles(fullPath));
        } else if (entry.name.endsWith(".md")) {
          results.push(fullPath);
        }
      }
      return results;
    };
    files.push(...getSkillMdFiles(skillsDir));
  }
  
  // Project config files
  const configFiles = [
    "AGENTS.md",
    "USER.md", 
    "SOUL.md",
    "IDENTITY.md",
    "TOOLS.md",
    "BOOTSTRAP.md",
    "HEARTBEAT.md",
    "ONBOARDING.md",
    "FIND-SKILLS-GUIDE.md",
    "fengshui_story_templates.md",
    "twitter_analysis.md",
    "weekly_content_calendar.md"
  ];
  
  for (const configFile of configFiles) {
    const fullPath = path.join(WORKSPACE_ROOT, configFile);
    if (fs.existsSync(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Import a single document to Convex
 */
async function importDocument(
  client: ConvexClient,
  filePath: string,
  stats: ImportStats
): Promise<void> {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(content);
    
    // Get relative path from workspace
    const relativePath = path.relative(WORKSPACE_ROOT, filePath).replace(/\\/g, "/");
    
    // Determine file type
    const type = getFileType(relativePath);
    
    // Extract title
    const title = extractTitle(filePath, body, frontmatter);
    
    // Build tags
    const tags: string[] = [];
    if (frontmatter.tags) {
      const tagList = frontmatter.tags.split(",").map((t: string) => t.trim());
      tags.push(...tagList);
    }
    if (type) {
      tags.push(type);
    }
    
    // Prepare document data
    const documentData: DocumentData = {
      title,
      content: body,
      path: relativePath,
      type,
      tags,
    };
    
    // Call Convex mutation
    await client.mutation("activities:addDocument", documentData);
    
    console.log(`✅ Imported: ${relativePath} (${type})`);
    stats.success++;
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed: ${filePath} - ${errorMsg}`);
    stats.failed++;
    stats.errors.push({ path: filePath, error: errorMsg });
  }
}

/**
 * Main import function
 */
async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("📄 Document Import to Convex");
  console.log("=".repeat(60));
  console.log(`Workspace: ${WORKSPACE_ROOT}`);
  console.log(`Convex URL: ${CONVEX_URL}`);
  console.log("");
  
  const stats: ImportStats = {
    total: 0,
    success: 0,
    failed: 0,
    errors: [],
  };
  
  // Get files to import
  const files = getMarkdownFiles();
  stats.total = files.length;
  
  console.log(`Found ${files.length} markdown files to import\n`);
  
  // Initialize Convex client
  const client = new ConvexClient(CONVEX_URL);
  
  // Import each file
  for (const filePath of files) {
    await importDocument(client, filePath, stats);
  }
  
  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Import Summary");
  console.log("=".repeat(60));
  console.log(`Total files:   ${stats.total}`);
  console.log(`✅ Success:     ${stats.success}`);
  console.log(`❌ Failed:      ${stats.failed}`);
  
  if (stats.errors.length > 0) {
    console.log("\nErrors:");
    for (const err of stats.errors) {
      console.log(`  - ${err.path}: ${err.error}`);
    }
  }
  
  console.log("\n✨ Import complete!");
  
  // Exit with error code if any failed
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run main
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
