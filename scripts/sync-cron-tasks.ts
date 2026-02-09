/**
 * Sync Cron Tasks to Convex Database
 * 
 * This script reads OpenClaw cron jobs and syncs them to the Mission Control database.
 * Usage: npx tsx scripts/sync-cron-tasks.ts
 */

import { execSync } from 'child_process';

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr?: string;
    everyMs?: number;
    tz?: string;
  };
  state: {
    nextRunAtMs: number;
    lastRunAtMs?: number;
    lastStatus: string;
    lastError?: string;
  };
}

interface CronTaskData {
  jobId: string;
  name: string;
  schedule: string;
  nextRun: number;
  lastRun?: number;
  status: string;
  lastError?: string;
  enabled: boolean;
}

function formatSchedule(schedule: CronJob['schedule']): string {
  if (schedule.kind === 'cron' && schedule.expr) {
    const expr = schedule.expr;
    // Parse cron expression
    const parts = expr.split(' ');
    if (parts.length === 5) {
      const [min, hour, day, month, weekday] = parts;
      
      // Common patterns
      if (expr === '0 22 * * *') return '每天 22:00';
      if (expr === '0 1 * * *') return '每天 01:00';
      if (expr === '0 8 * * *') return '每天 08:00';
      if (expr === '0 18 * * *') return '每天 18:00';
      if (expr === '20 10 * * *') return '每天 10:20';
      if (expr === '56 13 * * *') return '每天 13:56';
      if (expr === '46 19 * * *') return '每天 19:46';
      if (expr === '*/30 8-23 * * *') return '每30分钟 (8-23点)';
      if (expr.startsWith('0 */4,*/6')) return '每4-6小时';
      
      // Generic format
      if (min === '0' && hour !== '*') {
        return `每天 ${hour}:00`;
      }
      if (min !== '*' && hour !== '*') {
        return `每天 ${hour}:${min}`;
      }
    }
    return expr;
  }
  
  if (schedule.kind === 'every' && schedule.everyMs) {
    const minutes = Math.round(schedule.everyMs / 60000);
    if (minutes < 60) {
      return `每${minutes}分钟`;
    }
    const hours = Math.round(minutes / 60);
    return `每${hours}小时`;
  }
  
  return schedule.kind;
}

function getStatus(job: CronJob): string {
  if (!job.enabled) return 'paused';
  if (job.state?.lastStatus === 'error') return 'error';
  return 'active';
}

function fetchCronJobs(): CronJob[] {
  try {
    const output = execSync('openclaw cron list --json', { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    const data = JSON.parse(output);
    return data.jobs || [];
  } catch (error) {
    console.error('Failed to fetch cron jobs:', error);
    process.exit(1);
  }
}

async function syncToConvex(tasks: CronTaskData[]) {
  // Use Convex HTTP API to call the mutation
  const CONVEX_URL = process.env.CONVEX_URL || '';
  const CONVEX_DEPLOY_KEY = process.env.CONVEX_DEPLOY_KEY || '';
  
  if (!CONVEX_URL) {
    console.error('Error: CONVEX_URL environment variable not set');
    console.error('Please run: export CONVEX_URL=$(cat .env.local | grep CONVEX_URL | cut -d= -f2)');
    process.exit(1);
  }

  // Build the mutation request
  const url = `${CONVEX_URL}/api/mutation`;
  const body = {
    path: 'activities:syncCronTasks',
    args: { tasks }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(CONVEX_DEPLOY_KEY && { 'Authorization': `Bearer ${CONVEX_DEPLOY_KEY}` })
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log(`✓ Successfully synced ${result.value?.count || tasks.length} tasks to Convex`);
    return result;
  } catch (error) {
    console.error('Failed to sync to Convex:', error);
    throw error;
  }
}

async function main() {
  console.log('🔄 Syncing cron tasks to Mission Control database...\n');
  
  // Fetch cron jobs from OpenClaw
  const jobs = fetchCronJobs();
  console.log(`Found ${jobs.length} cron jobs`);
  
  // Transform to database format
  const tasks: CronTaskData[] = jobs.map(job => ({
    jobId: job.id,
    name: job.name,
    schedule: formatSchedule(job.schedule),
    nextRun: job.state?.nextRunAtMs || 0,
    lastRun: job.state?.lastRunAtMs,
    status: getStatus(job),
    lastError: job.state?.lastError,
    enabled: job.enabled,
  }));
  
  // Print summary
  console.log('\n📋 Task Summary:');
  const statusCount = { active: 0, error: 0, paused: 0 };
  tasks.forEach(task => {
    statusCount[task.status as keyof typeof statusCount]++;
    const statusIcon = task.status === 'active' ? '✓' : task.status === 'error' ? '✗' : '⏸';
    const nextRunStr = new Date(task.nextRun).toLocaleString('zh-CN');
    console.log(`  ${statusIcon} ${task.name}`);
    console.log(`     调度: ${task.schedule} | 下次运行: ${nextRunStr}`);
    if (task.lastError) {
      console.log(`     错误: ${task.lastError.substring(0, 80)}...`);
    }
  });
  
  console.log(`\n📊 Status Summary:`);
  console.log(`  ✓ Active: ${statusCount.active}`);
  console.log(`  ✗ Error: ${statusCount.error}`);
  console.log(`  ⏸ Paused: ${statusCount.paused}`);
  
  // Sync to Convex
  console.log('\n🚀 Uploading to Convex...');
  await syncToConvex(tasks);
  
  console.log('\n✅ Sync complete!');
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
