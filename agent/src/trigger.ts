/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// Starts one autoblog run. Workflows have no schedules yet, so a scheduler (any cron) can run this.
// Usage: node dist/trigger.js [hint...]

import { Render } from '@renderinc/sdk';
import type { AutoblogInput } from './tasks.js';

const slug = process.env.AUTOBLOG_WORKFLOW_SLUG || 'blogql-agent';
const hint = process.argv.slice(2).join(' ') || undefined;
const input: AutoblogInput = { blogHandle: process.env.BLOGQL_BLOG_HANDLE, hint };

// One run per day, even if the scheduler retries.
const day = new Date().toISOString().slice(0, 10);
const idempotencyKey = hint ? undefined : `autoblog-${day}`;

const render = new Render();
const run = await render.workflows.startTask(`${slug}/autoblog`, [input], { idempotencyKey });
console.log(`Started autoblog run ${run.taskRunId}`);
