/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// Render Workflow tasks for the autoblog agent. Each step is its own task, so Render runs it
// on its own instance, retries it on its own, and shows it as its own run in the dashboard.
// Task arguments and results must be JSON.

import { task, type TaskContext } from '@renderinc/sdk/workflows';
import { AGENT_NOTE, pickTopic, plainTitle, reviewPost, sanitizeContent, writePost } from './autoblog.js';
import type { Post, Review, Topic } from './autoblog.js';
import { BlogQLClient, type Draft } from './blogql.js';
import { ClaudeLLM } from './llm.js';

export interface AutoblogInput {
    blogHandle?: string;
    hint?: string;
}

export interface AutoblogResult {
    entryId: string;
    title: string;
    editUrl: string;
    reviewNotes: string[];
}

function env(name: string, fallback?: string): string {
    const value = process.env[name] || fallback;
    if (!value) {
        throw new Error(`${name} is not set`);
    }
    return value;
}

const llm = () => new ClaudeLLM(env('CLAUDE_MODEL', 'claude-opus-5-5'));
const blogql = () => new BlogQLClient({ url: env('BLOGQL_URL'), apiKey: process.env.BLOGQL_API_KEY });

// Claude calls can fail on overload or time out; wait and try again.
const llmRetry = { maxRetries: 3, waitDurationMs: 10_000, backoffScaling: 2 };
// BlogQL on the free plan can be asleep; the first request wakes it.
const blogqlRetry = { maxRetries: 3, waitDurationMs: 15_000, backoffScaling: 2 };

export const fetchRecentTitles = task(
    { name: 'fetchRecentTitles', plan: 'starter', timeoutSeconds: 300, retry: blogqlRetry },
    async function fetchRecentTitles(ctx: TaskContext, blogHandle: string): Promise<string[]> {
        return blogql().recentTitles(blogHandle);
    },
);

export const chooseTopic = task(
    { name: 'chooseTopic', plan: 'starter', timeoutSeconds: 300, retry: llmRetry },
    async function chooseTopic(ctx: TaskContext, recentTitles: string[], hint?: string): Promise<Topic> {
        return pickTopic(llm(), recentTitles, hint);
    },
);

export const draftPost = task(
    { name: 'draftPost', plan: 'starter', timeoutSeconds: 600, retry: llmRetry },
    async function draftPost(ctx: TaskContext, topic: Topic): Promise<Post> {
        return writePost(llm(), topic);
    },
);

export const editPost = task(
    { name: 'editPost', plan: 'starter', timeoutSeconds: 600, retry: llmRetry },
    async function editPost(ctx: TaskContext, post: Post): Promise<Review> {
        return reviewPost(llm(), post);
    },
);

export const saveDraft = task(
    { name: 'saveDraft', plan: 'starter', timeoutSeconds: 300, retry: blogqlRetry },
    async function saveDraft(ctx: TaskContext, blogHandle: string, post: Post): Promise<Draft> {
        const client = blogql();
        const title = plainTitle(post.title);
        // A retry after a lost response must not create a second copy.
        const existing = await client.findDraft(blogHandle, title);
        if (existing) {
            return existing;
        }
        return client.createDraft(blogHandle, title, `${sanitizeContent(post.html)}\n${AGENT_NOTE}`);
    },
);

// The entry point: pick a topic, write, edit, and save the post as a draft. It never publishes;
// the blog owner reads the draft and publishes it in BlogQL.
export const autoblog = task(
    { name: 'autoblog', plan: 'starter', timeoutSeconds: 3600 },
    async function autoblog(ctx: TaskContext, input: AutoblogInput = {}): Promise<AutoblogResult> {
        const blogHandle = input.blogHandle || env('BLOGQL_BLOG_HANDLE');
        const recentTitles = await ctx.run(fetchRecentTitles, blogHandle);
        const topic = await ctx.run(chooseTopic, recentTitles, input.hint);
        const draft = await ctx.run(draftPost, topic);
        const review = await ctx.run(editPost, draft);
        const saved = await ctx.run(saveDraft, blogHandle, review);
        const clientUrl = env('BLOGQL_CLIENT_URL', 'https://blogql-client.onrender.com');
        return {
            entryId: saved.id,
            title: saved.title,
            editUrl: `${clientUrl}/blogs/${encodeURIComponent(blogHandle)}/edit/${encodeURIComponent(saved.id)}`,
            reviewNotes: review.notes,
        };
    },
);
