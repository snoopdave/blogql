
// src/mocks/handlers.js
import {graphql} from "msw";

const now = new Date();

const blogs = {
    blogs: {
        nodes: [
            {
                id: 'dummy1',
                name: 'Blog One',
                handle: 'blog1',
                created: now,
                updated: now,
                user: {
                    id: 'user1',
                    username: 'user1'
                }
            },
            {
                id: 'dummy2',
                name: 'Blog Two',
                handle: 'blog2',
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

export const handlers = [
    // @ts-ignore
    graphql.query('Blogs', (req, res, ctx) => {
        return res(ctx.data(blogs));
    }),
];