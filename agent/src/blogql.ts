/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// Small client for the BlogQL GraphQL API. Writes use the blog owner's API key.

export interface BlogQLOptions {
    url: string;
    apiKey?: string;
    // The free Render web service sleeps after 15 minutes; the first request can take about a minute.
    timeoutMs?: number;
    fetch?: typeof fetch;
}

export interface Draft {
    id: string;
    title: string;
}

export class BlogQLClient {
    private readonly fetch: typeof fetch;

    constructor(private readonly options: BlogQLOptions) {
        this.fetch = options.fetch ?? fetch;
    }

    async recentTitles(handle: string, count = 20): Promise<string[]> {
        const data = await this.request<{
            blog: { entries: { edges: { node: { title: string } }[] } | null } | null;
        }>(
            `query RecentTitles($handle: String!, $first: Int) {
                blog(handle: $handle) { entries(first: $first) { edges { node { title } } } }
            }`,
            { handle, first: count },
        );
        if (!data.blog) {
            throw new Error(`Blog not found: ${handle}`);
        }
        return (data.blog.entries?.edges ?? []).map(e => e.node.title);
    }

    // Lets a retried save find the draft that an earlier attempt already created.
    async findDraft(handle: string, title: string, count = 20): Promise<Draft | undefined> {
        const data = await this.request<{
            blog: { drafts: { edges: { node: Draft }[] } | null } | null;
        }>(
            `query RecentDrafts($handle: String!, $first: Int) {
                blog(handle: $handle) { drafts(first: $first) { edges { node { id title } } } }
            }`,
            { handle, first: count },
        );
        return (data.blog?.drafts?.edges ?? []).map(e => e.node).find(d => d.title === title);
    }

    // createEntry makes a draft: an entry is published only when the owner publishes it.
    async createDraft(handle: string, title: string, content: string): Promise<Draft> {
        if (!this.options.apiKey) {
            throw new Error('BLOGQL_API_KEY is not set');
        }
        const data = await this.request<{ blog: { createEntry: Draft | null } | null }>(
            `mutation CreateDraft($handle: String!, $entry: EntryCreateInput) {
                blog(handle: $handle) { createEntry(entry: $entry) { id title } }
            }`,
            { handle, entry: { title, content } },
        );
        const draft = data.blog?.createEntry;
        if (!draft) {
            throw new Error(`Could not create a draft in blog ${handle}`);
        }
        return draft;
    }

    private async request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
        const headers: Record<string, string> = { 'content-type': 'application/json' };
        if (this.options.apiKey) {
            headers['x-api-key'] = this.options.apiKey;
        }
        const res = await this.fetch(this.options.url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, variables }),
            signal: AbortSignal.timeout(this.options.timeoutMs ?? 120_000),
        });
        if (!res.ok) {
            throw new Error(`BlogQL returned HTTP ${res.status}`);
        }
        const body = await res.json() as { data?: T; errors?: { message: string }[] };
        if (body.errors?.length) {
            throw new Error(`BlogQL error: ${body.errors.map(e => e.message).join('; ')}`);
        }
        if (!body.data) {
            throw new Error('BlogQL returned no data');
        }
        return body.data;
    }
}
