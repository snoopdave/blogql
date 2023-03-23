/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {graphql} from 'msw';
import {Blog, Entry} from '../graphql/schema';

const now = new Date();

export const handlers = [
    // @ts-ignore
    graphql.query('BlogQuery', (req, res, ctx) => {
        return res(ctx.data(blog1));
    }),
    // @ts-ignore
    graphql.query('Blogs', (req, res, ctx) => {
        return res(ctx.data(blogsData));
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

export const entriesData: Entry[] = [{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry1',
        'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry1',
        'title': 'Feline Grace',
        'content': 'Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat. Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    },{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry2',
        'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry2',
        'title': 'Whispered Secrets',
        'content': 'Whispered secrets kept,\nIn sparkling feline eyes aglow,\nMystery surrounds. Whispered secrets kept,\nIn sparkling feline eyes aglow,\nMystery surrounds. Whispered secrets kept,\nIn sparkling feline eyes aglow,\nMystery surrounds.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    },{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry3',
        'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry3',
        'title': 'A Cat\'s Nap',
        'content': 'In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    },{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry4',
        'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry4',
        'title': 'Feline Friend',
        'content': 'Purr in my ear,\nSoft fur under my hand, peace,\nFeline friend so dear.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    }];

const blog1 = {
    id: '6c93ee27-d3a9-4a44-9a28-2a100428184c-entry',
    key: '6c93ee27-d3a9-4a44-9a28-2a100428184c-entry',
    name: 'Dave\s Blog',
    handle: 'daves',
    created: now,
    updated: now,
    user: {
        id: 'user1',
        username: 'user1',
        email: 'user1@example.com',
        picture: 'http://example.com/image1.png'
    },
    entries: {
        nodes: entriesData,
        pageInfo: {
            totalCount: 20,
            cursor: 'dummy'
        }
    },
    drafts: {
        nodes: entriesData,
        pageInfo: {
            totalCount: 20,
            cursor: 'dummy'
        }
    },
};

const blog2 = {
    id: '6c93ee27-d3a9-4a44-9a28-2a100428184d-entry',
    key: '6c93ee27-d3a9-4a44-9a28-2a100428184d-entry',
    name: 'Blog One',
    handle: 'blog1',
    created: now,
    updated: now,
    user: {
        id: 'user2',
        username: 'user2',
        email: 'user2@example.com',
        picture: 'http://example.com/image2.png'
    },
    entries: {
        nodes: entriesData,
        pageInfo: {
            totalCount: 20,
            cursor: 'dummy'
        }
    },
    drafts: {
        nodes: entriesData,
        pageInfo: {
            totalCount: 20,
            cursor: 'dummy'
        }
    },
};

// blog with single entry
const blog3 = {
    id: '6c93ee27-d3a9-4a44-9a28-2a100428334d-entry',
    key: '6c93ee27-d3a9-4a44-9a28-2a100428334d-entry',
    name: 'Blog Two',
    handle: 'blog2',
    created: now,
    updated: now,
    user: {
        id: 'user3',
        username: 'user3',
        email: 'user3@example.com',
        picture: 'http://example.com/image3.png'
    },
    entry: {
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry3',
        'key': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry3',
        'title': 'A Cat\'s Nap',
        'content': 'In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream. In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    }
};

const blogsData = {
    blogs: {
        nodes: [blog1, blog2]
    }
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


