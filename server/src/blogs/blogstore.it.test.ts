/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from '../utils/dbconnection.js';
import {randomString} from "../utils/utils.js";
import BlogStore from './blogstore.js';
import {User} from '../users/user';
import {UserStore} from "../users/userstore";


describe('Test BlogStore', () => {

    test('It can connect to blog store', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let bs = new BlogStore(conn);
        await bs.init();
        try {
            expect(bs.db).toBeDefined();
        } finally {
            await conn.destroy();
        }
    });

    test('It can CRUD a blog', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let blogStore = new BlogStore(conn);
        await blogStore.init();
        const userStore = new UserStore(conn);
        await userStore.init();
        const user: User = await userStore.create(
            'test-user', 'test-user@example.com', 'dummy.png')
        try {
            const blogCreated = await blogStore.create(user.id, `myblog-${slug}`, 'My Blog');
            expect(blogCreated).toEqual({
                id: expect.any(String),
                name: 'My Blog',
                handle: `myblog-${slug}`,
                created: expect.any(Date),
                updated: expect.any(Date),
                userId: user.id
            });

            const blogRetrieved = await blogStore.retrieve(blogCreated.handle);
            expect(blogRetrieved).toEqual({
                id: blogCreated.id,
                name: 'My Blog',
                handle: `myblog-${slug}`,
                created: blogCreated.created,
                updated: blogCreated.updated,
                userId: user.id
            });

            const blogsRetrieved = await blogStore.retrieveAll(10, 0);
            expect(blogsRetrieved.rows).toHaveLength(1);

        } finally {
            await conn.destroy();
        }
    });

    test('It can page through blogs', async () => {
        let dbslug = randomString(5);
        let conn = new DBConnection(`./db-test-${dbslug}.db`);
        let blogStore = new BlogStore(conn);
        await blogStore.init();
        const userStore = new UserStore(conn);
        await userStore.init();
        try {
            for (let i = 0; i < 25; i++) {
                let slug = randomString(5);
                const user: User = await userStore.create(
                    `test-user-${slug}`, 'test-user-${slug}@example.com', 'dummy.png')
                await blogStore.create(user.id, `myblog-${i}`, `My Blog ${i}`);
            }

            const blogsRetrieved = await blogStore.retrieveAll(10, 0);
            expect(blogsRetrieved.rows).toHaveLength(10);

            const blogsRetrieved2 = await blogStore.retrieveAll(10, 10);
            expect(blogsRetrieved2.rows).toHaveLength(10);

            const blogsRetrieved3 = await blogStore.retrieveAll(10, 20);
            expect(blogsRetrieved3.rows).toHaveLength(5);

            const blogsRetrieved4 = await blogStore.retrieveAll(10, 25);
            expect(blogsRetrieved4.rows).toHaveLength(0);

        } finally {
            await conn.destroy();
        }
    });

    test('It can page through blogs in reverse', async () => {

        let dbslug = randomString(5);
        let conn = new DBConnection(`./db-test-${dbslug}.db`);
        let blogStore = new BlogStore(conn);
        await blogStore.init();
        const userStore = new UserStore(conn);
        await userStore.init();
        try {
            for (let i = 0; i < 25; i++) {
                let slug = randomString(5);
                const user: User = await userStore.create(
                    `test-user-${slug}`, 'test-user-${slug}@example.com', 'dummy.png')
                await blogStore.create(user.id, `myblog-${i}`, `My Blog ${i}`);
            }

            const blogsRetrieved = await blogStore.retrieveAll(10, 0);
            expect(blogsRetrieved.rows).toHaveLength(10);

            const blogsRetrieved2 = await blogStore.retrieveAll(10, 10);
            expect(blogsRetrieved2.rows).toHaveLength(10);
        } finally {
            await conn.destroy();
        }
    });

    test('It will not allow a user to create more than one blog', async () => {
        let dbslug = randomString(5);
        let conn = new DBConnection(`./db-test-${dbslug}.db`);
        let blogStore = new BlogStore(conn);
        await blogStore.init();
        const userStore = new UserStore(conn);
        await userStore.init();
        try {
            let slug = randomString(5);
            const user: User = await userStore.create(
                `test-user-${slug}`, 'test-user-${slug}@example.com', 'dummy.png')
            await blogStore.create(user.id, `myblog-${slug}`, `My Blog ${slug}`);
            await expect(blogStore.create(user.id, `myblog2-${slug}`, `My Blog 2 ${slug}`)).rejects.toThrow();
        } finally {
            await conn.destroy();
        }
    });
});

export {}
