/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

// src/mocks/handlers.js
import {graphql} from 'msw';
import {Entry} from "../graphql/schema";

const now = new Date();

export const handlers = [
    // @ts-ignore
    graphql.query('Blogs', (req, res, ctx) => {
        return res(ctx.data(blogsData));
    }),
    // @ts-ignore
    graphql.query('EntriesQuery', (req, res, ctx) => {
        return res(ctx.data(entriesData));
    }),
];

const blogsData = {
    blogs: {
        nodes: [
            {
                id: '6c93ee27-d3a9-4a44-9a28-2a100428184c-entry',
                name: 'Dave\s Blog',
                handle: 'daves',
                created: now,
                updated: now,
                user: {
                    id: 'user1',
                    username: 'user1'
                }
            }, {
                id: '6c93ee27-d3a9-4a44-9a28-2a100428184d-entry',
                name: 'Blog One',
                handle: 'blog1',
                created: now,
                updated: now,
                user: {
                    id: 'user2',
                    username: 'user2'
                }
            },
        ]
    }
};

export const entriesData: Entry[] = [{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry1',
        'title': 'Feline Grace',
        'content': 'Silent paws tread,\nElegant feline form glides,\nMy heart skips a beat.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    },{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry2',
        'title': 'Whispered Secrets',
        'content': 'Whispered secrets kept,\nIn sparkling feline eyes aglow,\nMystery surrounds.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    },{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry3',
        'title': 'A Cat\'s Nap',
        'content': 'In sunbeam warm,\nSoft purring lulls me to sleep,\nDreams of mice and cream.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    },{
        'id': '29e9b074-0727-4ee4-ba6a-e4efdcaacaf8-entry4',
        'title': 'Feline Friend',
        'content': 'Purr in my ear,\nSoft fur under my hand, peace,\nFeline friend so dear.',
        'created': new Date('2022-06-26T21:41:12.932Z'),
        'updated': new Date('2022-07-08T12:23:36.697Z'),
        'published': new Date('2022-11-20T20:25:40.974Z')
    }];
