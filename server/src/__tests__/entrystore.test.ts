/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from '../dbconnection';
import {EntryStore} from '../entrystore';
import {randomString} from './userstore.test';
import BlogStore from "../blogstore";
import {User, UserStore} from "../userstore";


describe('Test EntryStore', () => {

    test('It can connect to entry store', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let es = new EntryStore(conn);
        await es.init();
        try {
            expect(es.db).toBeDefined();
        } finally {
            await conn.destroy();
        }
    });

    test('It can CRUD an entry', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let blogStore = new BlogStore(conn);
        await blogStore.init();
        let entryStore = new EntryStore(conn);
        await entryStore.init();
        const userStore = new UserStore(conn);
        await userStore.init();
        const user: User = await userStore.create(
            `test-user-${slug}`, 'test-user@example.com', 'dummy.png')
        try {
            const blog = await blogStore.create(user.id, `blog-${slug}`, `Blog ${slug}`)
            const entryCreated = await entryStore.create(blog.id, 'entry title', 'has content');
            expect(entryCreated).toHaveProperty('id');
            expect(entryCreated).toHaveProperty('title', 'entry title');
            expect(entryCreated).toHaveProperty('content', 'has content');
            expect(entryCreated).toHaveProperty('created');
            expect(entryCreated).toHaveProperty('updated');

            const entryRetrieved = await entryStore.retrieve(entryCreated.id);
            expect(entryRetrieved).toHaveProperty('id');
            expect(entryRetrieved).toHaveProperty('title', 'entry title');
            expect(entryRetrieved).toHaveProperty('content', 'has content');
            expect(entryRetrieved).toHaveProperty('created');
            expect(entryRetrieved).toHaveProperty('updated');

            const entriesRetrieved = await entryStore.retrieveAllDrafts(blog.id, 10, 0);
            expect(entriesRetrieved.rows).toHaveLength(1);

        } finally {
            await conn.destroy();
        }
    });

    test('It can publish an entry', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let blogStore = new BlogStore(conn);
        await blogStore.init();
        let entryStore = new EntryStore(conn);
        await entryStore.init();
        const userStore = new UserStore(conn);
        await userStore.init();
        const user: User = await userStore.create(
            `test-user-${slug}`, 'test-user@example.com', 'dummy.png')
        try {
            const blog = await blogStore.create(user.id, `blog-${slug}`, `Blog ${slug}`)
            const entryCreated = await entryStore.create(blog.id, 'entry title', 'has content');

            expect((await entryStore.retrieveAll(blog.id, 10, 0)).count).toBe(0);
            expect((await entryStore.retrieveAllDrafts(blog.id, 10, 0)).count).toBe(1);

            await entryStore.publish(entryCreated.id);

            expect((await entryStore.retrieveAll(blog.id, 10, 0)).count).toBe(1);
            expect((await entryStore.retrieveAllDrafts(blog.id, 10, 0)).count).toBe(0);

            await entryStore.unPublish(entryCreated.id);

            expect((await entryStore.retrieveAll(blog.id, 10, 0)).count).toBe(0);
            expect((await entryStore.retrieveAllDrafts(blog.id, 10, 0)).count).toBe(1);

        } finally {
            await conn.destroy();
        }
    });

    test('It can page through entries', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let blogStore = new BlogStore(conn);
        await blogStore.init();
        let entryStore = new EntryStore(conn);
        await entryStore.init();
        const userStore = new UserStore(conn);
        await userStore.init();
        const user: User = await userStore.create(
            `test-user-${slug}`, 'test-user@example.com', 'dummy.png')
        try {
            const blog = await blogStore.create(user.id, `blog-${slug}`, `Blog ${slug}`)
            for (let i = 0; i < 25; i++) {
                let entry = await entryStore.create(blog.id, `entry title ${i}`, 'has content');
                await entryStore.publish(entry.id);
            }

            const entriesRetrieved = await entryStore.retrieveAll(blog.id, 10, 0);
            expect(entriesRetrieved.rows).toHaveLength(10);

            const entriesRetrieved2 = await entryStore.retrieveAll(blog.id, 10, 10);
            expect(entriesRetrieved2.rows).toHaveLength(10);

            const entriesRetrieved3 = await entryStore.retrieveAll(blog.id, 10, 20);
            expect(entriesRetrieved3.rows).toHaveLength(5);

            const entriesRetrieved4 = await entryStore.retrieveAll(blog.id, 10, 25);
            expect(entriesRetrieved4.rows).toHaveLength(0);

        } finally {
            await conn.destroy();
        }
    });
});
