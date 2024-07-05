/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {graphql} from 'msw';
import {fixture} from "./BlogsFixture";

export const handlers = [
    // @ts-ignore
    graphql.query('BlogQuery', (req, res, ctx) => {
        return res(ctx.data({ blog: fixture.blogs!.edges[0]!.node }));
    }),
    // @ts-ignore
    graphql.query('Blogs', (req, res, ctx) => {
        const {limit, offset} = req.variables;
        const blogs = fixture.blogs.edges.slice(offset, offset + limit);
        return res(ctx.data({ blogs: fixture.blogs }));
    }),
    // @ts-ignore
    graphql.query('EntriesQuery', (req, res, ctx) => {
        const {limit, offset} = req.variables;
        const entries = fixture.blogs.edges[0].node.entries?.edges.slice(offset, offset + limit);
        return res(ctx.data({ blog: {
                ...fixture.blogs.edges[0].node,
                entries
            } }));
    }),
    // @ts-ignore
    graphql.query('DraftsQuery', (req, res, ctx) => {
        const {limit, offset} = req.variables;
        const drafts = fixture.blogs.edges[1].node.entries?.edges.slice(offset, offset + limit);
        return res(ctx.data({ blog: {
                ...fixture.blogs.edges[1].node,
                drafts: fixture.blogs.edges[1].node.entries
            } }));
    }),
    // @ts-ignore
    graphql.query('EntryQuery', (req, res, ctx) => {
        return res(ctx.data({ blog: {
            ...fixture.blogs.edges[3]!.node,
            entry: fixture.blogs!.edges[3]!.node.entries?.edges[0]?.node
        }}));
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

export const userBlogQueryData = {
    'blogForUser': {
        'id': 'dummy',
        'handle': 'blog2',
    }
};

export const userNoBlogQueryData = {
    'blogForUser': null
};


