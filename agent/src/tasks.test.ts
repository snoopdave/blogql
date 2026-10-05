/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// Runs the whole autoblog task in-process. A fake fetch plays both Claude and BlogQL.

import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import type { TaskContext, TaskDefinition } from '@renderinc/sdk/workflows';
import { autoblog } from './tasks.js';

const ctx: TaskContext = {
    metadata: {},
    run<A extends unknown[], R>(t: TaskDefinition<A, R>, ...args: A): Promise<R> {
        return Promise.resolve(t.func(ctx, ...args));
    },
};

interface Call { url: string; body: any; headers: Record<string, string> }

let calls: Call[];
let drafts: { id: string; title: string }[];
const realFetch = globalThis.fetch;
const saved = { ...process.env };

function claudeReply(json: unknown): Response {
    return Response.json({
        id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5-5',
        content: [{ type: 'text', text: JSON.stringify(json) }],
        stop_reason: 'end_turn', stop_sequence: null,
        usage: { input_tokens: 1, output_tokens: 1 },
    });
}

beforeEach(() => {
    calls = [];
    drafts = [];
    Object.assign(process.env, {
        ANTHROPIC_API_KEY: 'test-key',
        ANTHROPIC_WORKSPACE_ID: 'wrkspc_test',
        BLOGQL_URL: 'https://blogql.test/graphql',
        BLOGQL_API_KEY: 'blog-key',
        BLOGQL_BLOG_HANDLE: 'testblog',
        BLOGQL_CLIENT_URL: 'https://client.test',
    });
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const req = new Request(input, init);
        const body = await req.json();
        calls.push({ url: req.url, body, headers: Object.fromEntries(req.headers) });
        if (req.url.startsWith('https://api.anthropic.com')) {
            const prompt: string = body.messages[0].content;
            if (prompt.startsWith('Suggest')) {
                return claudeReply({ title: 'Topic', angle: 'Why', outline: ['One', 'Two'] });
            }
            if (prompt.startsWith('Write')) {
                return claudeReply({ title: 'Draft', html: '<p>First draft</p>' });
            }
            return claudeReply({ title: 'Final <i>title</i>', html: '<p>Edited</p><script>x</script>', notes: ['Shorter'] });
        }
        if (body.query.includes('RecentTitles')) {
            return Response.json({ data: { blog: { entries: { edges: [{ node: { title: 'Old post' } }] } } } });
        }
        if (body.query.includes('RecentDrafts')) {
            return Response.json({ data: { blog: { drafts: { edges: drafts.map(node => ({ node })) } } } });
        }
        const entry = { id: 'e1-entry', title: body.variables.entry.title };
        drafts.push(entry);
        return Response.json({ data: { blog: { createEntry: entry } } });
    }) as typeof fetch;
});

afterEach(() => {
    globalThis.fetch = realFetch;
    process.env = { ...saved };
});

test('autoblog writes, edits and saves a sanitized draft', async () => {
    const result = await autoblog.func(ctx, { hint: 'GraphQL' });

    assert.deepEqual(result, {
        entryId: 'e1-entry',
        title: 'Final title',
        editUrl: 'https://client.test/blogs/testblog/edit/e1-entry',
        reviewNotes: ['Shorter'],
    });
    const create = calls.find(c => c.body.query?.includes('CreateDraft'))!;
    assert.equal(create.headers['x-api-key'], 'blog-key');
    assert.equal(create.body.variables.handle, 'testblog');
    assert.match(create.body.variables.entry.content, /^<p>Edited<\/p>\n<p><em>Drafted by/);
    assert.doesNotMatch(create.body.variables.entry.content, /script/);
    const claude = calls.filter(c => c.url.startsWith('https://api.anthropic.com'));
    assert.equal(claude.length, 3);
    assert.equal(claude[0].body.model, 'claude-opus-5-5');
    assert.equal(claude[0].headers['anthropic-workspace-id'], 'wrkspc_test');
    assert.match(claude[0].body.messages[0].content, /GraphQL[\s\S]*- Old post/);
});

test('a second save of the same post reuses the draft', async () => {
    await autoblog.func(ctx, {});
    await autoblog.func(ctx, {});
    assert.equal(calls.filter(c => c.body.query?.includes('CreateDraft')).length, 1);
});
