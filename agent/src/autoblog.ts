/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// The steps of the autoblog agent, without Render. tasks.ts runs each step as a workflow task.

import sanitizeHtml from 'sanitize-html';
import type { LLM, ObjectSchema } from './llm.js';

export interface Topic {
    title: string;
    angle: string;
    outline: string[];
}

export interface Post {
    title: string;
    html: string;
}

export interface Review extends Post {
    notes: string[];
}

const AUTHOR = `You write for BlogQL, a small personal tech blog by a software developer.
Readers are developers. Write in a plain, direct, first-person voice. No hype, no marketing words.
Prefer concrete details and short code examples over general statements.
Do not invent facts, quotes, benchmarks, version numbers or links. If you are not sure, leave it out.`;

const topicSchema: ObjectSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', description: 'Working title, plain text' },
        angle: { type: 'string', description: 'One or two sentences: the point of the post' },
        outline: { type: 'array', items: { type: 'string' }, description: '3 to 6 section headings' },
    },
    required: ['title', 'angle', 'outline'],
    additionalProperties: false,
};

const postSchema: ObjectSchema = {
    type: 'object',
    properties: {
        title: { type: 'string', description: 'Final title, plain text, no HTML' },
        html: { type: 'string', description: 'Post body as HTML' },
    },
    required: ['title', 'html'],
    additionalProperties: false,
};

const reviewSchema: ObjectSchema = {
    type: 'object',
    properties: {
        ...(postSchema.properties as object),
        notes: { type: 'array', items: { type: 'string' }, description: 'What you changed and why' },
    },
    required: ['title', 'html', 'notes'],
    additionalProperties: false,
};

const HTML_RULES = `Use only these HTML tags: p, h2, h3, ul, ol, li, strong, em, code, pre, blockquote, a, br.
Do not include the title as a heading, and do not wrap the body in html, body or article tags.
Aim for 600 to 1000 words.`;

export async function pickTopic(llm: LLM, recentTitles: string[], hint?: string): Promise<Topic> {
    const recent = recentTitles.length > 0
        ? `Recent posts on the blog (do not repeat them):\n${recentTitles.map(t => `- ${t}`).join('\n')}`
        : 'The blog has no posts yet.';
    const ask = hint
        ? `Suggest a post about this subject: ${hint}`
        : 'Suggest a post about software development, cloud platforms, GraphQL, or developer tools.';
    return llm.generate<Topic>(AUTHOR, `${ask}\n\n${recent}`, topicSchema);
}

export async function writePost(llm: LLM, topic: Topic): Promise<Post> {
    const prompt = `Write a blog post.
Title: ${topic.title}
Point of the post: ${topic.angle}
Sections:
${topic.outline.map(s => `- ${s}`).join('\n')}

${HTML_RULES}`;
    return llm.generate<Post>(AUTHOR, prompt, postSchema);
}

export async function reviewPost(llm: LLM, post: Post): Promise<Review> {
    const prompt = `You are the editor. Review this draft and return an improved version.
- Remove claims that may not be true, and anything that sounds like marketing.
- Fix errors in code examples.
- Make it shorter where you can.
- Keep the author's voice.

${HTML_RULES}

Title: ${post.title}

${post.html}`;
    return llm.generate<Review>(AUTHOR, prompt, reviewSchema);
}

// BlogQL renders entry HTML as is, so never trust model output.
export function sanitizeContent(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: ['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote', 'a', 'br'],
        allowedAttributes: { a: ['href', 'rel'] },
        allowedSchemes: ['https', 'http'],
        transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'nofollow noopener' }) },
    }).trim();
}

export function plainTitle(title: string): string {
    return sanitizeHtml(title, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim().slice(0, 200);
}

export const AGENT_NOTE = '<p><em>Drafted by the BlogQL autoblog agent. Review before you publish.</em></p>';
