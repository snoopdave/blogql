
// src/mocks/handlers.js
import {graphql} from "msw";

const now = new Date();

const blogs = {
    blogs: {
        __typename: 'BlogResponse',
        nodes: [{
            __typename: 'Blog',
            id: 'dummy1',
            name: 'Blog One',
            handle: 'blog1',
            created: now,
            updated: now,
            user: {
                __typename: 'User',
                id: 'user1',
                username: 'user1'
            }
        },
        {
            __typename: 'Blog',
            id: 'dummy2',
            name: 'Blog Two',
            handle: 'blog2',
            created: now,
            updated: now,
            user: {
                __typename: 'User',
                id: 'user2',
                username: 'user2'
            }
        },
        ]
    },
};

export const handlers = [
    // @ts-ignore
    graphql.query('Blogs', (req, res, ctx) => {
        return res(ctx.data(blogs));
    }),
];