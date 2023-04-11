/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {graphql} from 'msw';
import {Blog, BlogEdge, Entry, EntryEdge, Scalars} from "../gql/graphql";

const now = new Date();

export const handlers = [
    // @ts-ignore
    graphql.query('BlogQuery', (req, res, ctx) => {
        return res(ctx.data(blog1));
    }),
    // @ts-ignore
    graphql.query('Blogs', (req, res, ctx) => {
        return res(ctx.data(blogsQueryData));
    }),
    // @ts-ignore
    graphql.query('EntriesQuery', (req, res, ctx) => {
        return res(ctx.data(entriesQueryData));
    }),
    // @ts-ignore
    graphql.query('DraftsQuery', (req, res, ctx) => {
        return res(ctx.data(entriesQueryData));
    }),
    // @ts-ignore
    graphql.query('EntryQuery', (req, res, ctx) => {
        return res(ctx.data(entryQueryData));
    }),
    // @ts-ignore
    graphql.query('UserBlogQuery', (req, res, ctx) => {
        if (req.variables.userId !== '') {
            return res(ctx.data(userBlogQueryData));
        }
        return res(ctx.data(userNoBlogQueryData));
    }),
];

//------------------------------------------------------------------- Entries

// some queries add an alias for id named 'key' this, so it's needed in mocks
interface TestEntry extends Entry {
    key: string;
}

interface TestEntryEdge {
    cursor: string;
    node: TestEntry;
};

const entry1: TestEntry = {
    'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry1',
    'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry1',
    'title': 'Feline Grace',
    'content': 'Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat.',
    'created': new Date('2022-06-26T21:41:12.932Z'),
    'updated': new Date('2022-07-08T12:23:36.697Z'),
    'published': new Date('2022-11-20T20:25:40.974Z')
};
const entry2: TestEntry = {
    'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry2',
    'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry2',
    'title': 'Whispered Secrets',
    'content': 'Whispered secrets kept,\nIn sparkling feline eyes aglow,\nMystery surrounds. Whispered secrets kept,\nIn sparkling feline eyes aglow,\nMystery surrounds. Whispered secrets kept,\nIn sparkling feline eyes aglow,\nMystery surrounds.',
    'created': new Date('2022-06-26T21:41:12.932Z'),
    'updated': new Date('2022-07-08T12:23:36.697Z'),
    'published': new Date('2022-11-20T20:25:40.974Z'),
};
const entry3: TestEntry = {
    'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry3',
    'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry3',
    'title': 'A Cat\'s Nap',
    'content': 'In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream.',
    'created': new Date('2022-06-26T21:41:12.932Z'),
    'updated': new Date('2022-07-08T12:23:36.697Z'),
    'published': new Date('2022-11-20T20:25:40.974Z'),
};
const entry4: TestEntry = {
    'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry4',
    'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry4',
    'title': 'Feline Friend',
    'content': 'Purr in my ear,\nSoft fur under my hand, peace,\nFeline friend so dear.',
    'created': new Date('2022-06-26T21:41:12.932Z'),
    'updated': new Date('2022-07-08T12:23:36.697Z'),
    'published': new Date('2022-11-20T20:25:40.974Z'),
};

export const entriesData: TestEntryEdge[] = [{
        'node': entry1,
        'cursor': 'dummy1',
    },{
        'node': entry2,
        'cursor': 'dummy2',
    },{
        'node': entry3,
        'cursor': 'dummy3',
    },{
        'node': entry4,
        'cursor': 'dummy4',
    }];

//------------------------------------------------------------------- Blogs

// some queries add an alias for id named 'key' this, so it's needed in mocks
interface TestBlog extends Blog {
    key: string;
}

interface TestBlogEdge {
    cursor: string;
    node: TestBlog;
};

const blog1: TestBlog = {
    id: '6c93ee27-d3a9-4a44-9a28-2a100428184c-blog',
    key: '6c93ee27-d3a9-4a44-9a28-2a100428184c-blog',
    name: 'Dave\s Blog',
    handle: 'daves',
    created: now,
    updated: now,
    userId: 'user1',
    user: {
        id: 'user1',
        username: 'user1',
        email: 'user1@example.com',
        picture: 'http://example.com/image1.png',
        created: now,
        updated: now,
    },
    entries: {
        edges: entriesData,
        pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'dummy',
            endCursor: 'dummy',
        }
    },
    drafts: {
        edges: entriesData,
        pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'dummy',
            endCursor: 'dummy',
        }
    },
};
const blog2: TestBlog = {
    id: '6c93ee27-d3a9-4a44-9a28-2a100428184d-blog',
    key: '6c93ee27-d3a9-4a44-9a28-2a100428184d-blog',
    name: 'Blog One',
    handle: 'blog1',
    created: now,
    updated: now,
    userId: 'user2',
    user: {
        id: 'user2',
        username: 'user2',
        email: 'user2@example.com',
        picture: 'http://example.com/image2.png',
        created: now,
        updated: now,
    },
    entries: {
        edges: entriesData,
        pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'dummy',
            endCursor: 'dummy',
        }
    },
    drafts: {
        edges: entriesData,
        pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'dummy',
            endCursor: 'dummy',
        }
    },
};
const blog3: TestBlog = {
    id: '6c93ee27-d3a9-4a44-9a28-2a100428334d-blog',
    key: '6c93ee27-d3a9-4a44-9a28-2a100428334d-blog',
    name: 'Blog Two',
    handle: 'blog2',
    created: now,
    updated: now,
    userId: 'user3',
    user: {
        id: 'user3',
        created: now,
        updated: now,
        username: 'user3',
        email: 'user3@example.com',
        picture: 'http://example.com/image3.png'
    },
    entry: entry3,
};

//------------------------------------------------------------------- Query data

const blogsQueryData = {
    blogs: {
        edges: [{
            node: blog1,
            cursor: 'dummy',
        }, {
            node: blog2,
            cursor: 'dummy',
        },
        ],
        pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'dummy',
            endCursor: 'dummy',
        }
    },
};

export const entriesQueryData = {
    'blog': blog2
};

export const entryQueryData = {
    'blog': blog3
};

export const userBlogQueryData = {
    'blogForUser': {
        'id': 'dummy',
        'handle': 'blog2',
    }
};

export const userNoBlogQueryData = {
    'blogForUser': null
};


