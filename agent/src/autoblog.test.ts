/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pickTopic, plainTitle, sanitizeContent } from './autoblog.js';
import type { LLM } from './llm.js';

test('sanitizeContent removes scripts, handlers and unknown tags', () => {
    const html = '<h1>T</h1><p onclick="x()">Hi <script>alert(1)</script><b>there</b></p>'
        + '<a href="javascript:alert(1)">bad</a><a href="https://example.com">good</a><img src=x onerror=y>';
    assert.equal(sanitizeContent(html),
        'T<p>Hi there</p><a rel="nofollow noopener">bad</a><a href="https://example.com" rel="nofollow noopener">good</a>');
});

test('sanitizeContent keeps the tags the prompt allows', () => {
    const html = '<h2>A</h2><p><strong>b</strong> <em>c</em> <code>d</code></p><pre><code>e</code></pre>'
        + '<ul><li>f</li></ul><ol><li>g</li></ol><blockquote>h</blockquote>';
    assert.equal(sanitizeContent(html), html);
});

test('plainTitle strips HTML and long whitespace', () => {
    assert.equal(plainTitle('  <b>Hello</b>\n  world  '), 'Hello world');
    assert.equal(plainTitle('x'.repeat(300)).length, 200);
});

test('pickTopic tells the model the recent titles and the hint', async () => {
    let prompt = '';
    const llm: LLM = {
        async generate<T>(_system: string, p: string): Promise<T> {
            prompt = p;
            return { title: 't', angle: 'a', outline: ['o'] } as T;
        },
    };
    const topic = await pickTopic(llm, ['Old post'], 'Render Workflows');
    assert.deepEqual(topic, { title: 't', angle: 'a', outline: ['o'] });
    assert.match(prompt, /Render Workflows/);
    assert.match(prompt, /- Old post/);
});
