/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from '../dbconnection';
import {randomString} from './userstore.test';
import BlogStore from '../blogstore';
import UserStore, {User} from '../userstore';


describe('Test BlogStore', () => {

    test('It can connect to blog store', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-tbst-${slug}.db`);
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
            expect(blogCreated).toHaveProperty('id');
            expect(blogCreated).toHaveProperty('name', 'My Blog');
            expect(blogCreated).toHaveProperty('handle', `myblog-${slug}`);
            expect(blogCreated).toHaveProperty('created');
            expect(blogCreated).toHaveProperty('updated');

            const blogRetrieved = await blogStore.retrieve(blogCreated.handle);
            expect(blogRetrieved).toHaveProperty('id');
            expect(blogRetrieved).toHaveProperty('name', 'My Blog');
            expect(blogRetrieved).toHaveProperty('handle', `myblog-${slug}`);
            expect(blogRetrieved).toHaveProperty('created');
            expect(blogRetrieved).toHaveProperty('updated');

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
});
