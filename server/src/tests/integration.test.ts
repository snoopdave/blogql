/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from '../entries/entry.js';
import {describe, expect, test} from '@jest/globals';
import {v4 as uuid} from 'uuid';
import {ApolloServer, gql} from 'apollo-server';
import resolvers from '../resolvers.js';
import {randomString} from "../utils.js";
import {Blog} from '../blogs/blog.js';
import {GraphQLResponse} from 'apollo-server-types';
import {User} from '../users/user.js';
import DBConnection from '../dbconnection.js';
import {readFileSync} from 'fs';
import {BlogService, BlogServiceSequelizeImpl} from "../blogservice";
import {UserStore} from "../users/userstore";
import BlogStore from "../blogs/blogstore";
import {EntryStore} from "../entries/entrystore";
import {ResponseEdge} from "../pagination";
import {
    createBlog,
    createEntry,
    deleteBlog,
    deleteEntry,
    GET_BLOGS_QUERY,
    GET_ENTRIES_QUERY,
    getBlog,
    getBlogForUser,
    getBlogs,
    getEntry,
    updateBlog,
    updateEntry
} from "./integration_test_queries";
import {createBlogAndTestEntriesViaSql, createTestBlogsViaSql, NUM_BLOGS, NUM_ENTRIES} from "./integration_test_data";

describe('Test the GraphQL API integration', () => {

    interface TestContext {
        server: ApolloServer;
        conn: DBConnection;
        userStore: UserStore;
        blogStore: BlogStore;
        entryStore: EntryStore;
        authUsers: User[];
    }

    async function initDataStorage(): Promise<TestContext> {
        const conn = new DBConnection(`./db-test-${randomString(5)}.db`);
        const userStore = new UserStore(conn)
        await userStore.init();
        let authUsers: User[] = [];
        for (let i = 0; i < NUM_BLOGS; i++) {
            const slug = randomString(5);
            authUsers.push(await userStore.create(
                `test-user-${slug}`,
                `test-user-${slug}@example.com`,
                'dummy.png'));
        }

        const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context: () => {
                const user = authUsers[0];
                const blogService: BlogService = new BlogServiceSequelizeImpl(user, conn);
                return { user, blogService }
            }
        });

        const blogStore = new BlogStore(conn);
        await blogStore.init();
        const entryStore = new EntryStore(conn);
        await entryStore.init();

        return {server, conn, userStore, blogStore, entryStore, authUsers};
    }

    test('It can get blog for a user', async () => {
        const {server, conn, authUsers} = await initDataStorage();
        const slug = randomString(5);
        const blog = await createBlog(server, `My Blog ${slug}`, `myblog${slug}`);
        blog?.data?.createBlog.id;
        try {
            let data = await getBlogForUser(server, authUsers[0].id);
            expect(data.errors).toBeUndefined();
            expect(data?.data?.blogForUser?.id).toBe(blog?.data?.createBlog.id);
        } finally {
            await conn.destroy();
        }
    });

    test('It can create new entries via GraphQL', async () => {
        const {server, conn, blogStore, authUsers} = await initDataStorage();
        try {
            const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
            const entryCreated = await createEntry(server, blog.handle, 'First post!', 'LOL');
            expect(entryCreated.errors).toBeUndefined();
            expect(entryCreated.data?.blog.createEntry.title).toBe('First post!')
            verifyDate(entryCreated.data?.blog.createEntry.created);
            verifyDate(entryCreated.data?.blog.createEntry.updated);
        } finally {
            await conn.destroy();
        }
    });

    test('It can return limited blog entries from the database', async () => {
        const limit = 2;
        const {server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);
        let payload = { query: GET_ENTRIES_QUERY, variables: {
                handle: blog.handle,
                first: limit,
            }};
        try {
            const result = await server.executeOperation(payload);
            expect(result.errors).toBeUndefined();
            expect(result.data?.blog.entries.edges).toHaveLength(limit);
        } finally {
            await conn.destroy();
        }
    });

    test('It can page through all entries', async () => {
        const {server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);
        const dataRetrieved: Entry[] = [];
        try {
            await testPageThroughEntries(server, blog.handle, NUM_ENTRIES, NUM_ENTRIES);
            await testPageThroughEntries(server, blog.handle, 1, NUM_ENTRIES);
            await testPageThroughEntries(server, blog.handle, 2, NUM_ENTRIES);
            await testPageThroughEntries(server, blog.handle, 10, NUM_ENTRIES);
            await testPageThroughEntries(server, blog.handle, NUM_ENTRIES + 20, NUM_ENTRIES);
        } finally {
            await conn.destroy();
        }
    }, 20000); // timeout for long running test


    async function testPageThroughEntries(server: ApolloServer, handle: string, pageSize: number | null, expectedSize: number) {
        const payload = {query: GET_ENTRIES_QUERY, variables: { handle, first: pageSize}};
        const dataRetrieved: Entry[] = [];
        await getAllEntries(server, payload, dataRetrieved);
        expect(dataRetrieved).toHaveLength(expectedSize);
    }


    it('should fetch all 100 entries in reverse chronological order', async () => {
        const {conn, server, blogStore, entryStore, authUsers} = await initDataStorage();
        try {
            const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);

            const response = await server.executeOperation({
                query: GET_ENTRIES_QUERY,
                variables: {handle: blog.handle, first: NUM_ENTRIES},
            });

            const entries = response.data?.blog.entries.edges.map((edge: any) => edge.node);
            expect(entries.length).toBe(authUsers.length);

            for (let i = 1; i < entries.length; i++) {
                expect(new Date(entries[i - 1].updated).getTime())
                    .toBeGreaterThanOrEqual(new Date(entries[i].updated).getTime());
            }
        } finally {
            await conn.destroy();
        }
    });

    it('should paginate forward 5 items at a time in reverse chronological order', async () => {
        const {conn, server, blogStore, entryStore, authUsers} = await initDataStorage();
        try {
            const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);

            let afterCursor = null;
            const allEntries: any[] = [];

            for (let i = 0; i < 20; i++) {
                const response: GraphQLResponse = await server.executeOperation({
                    query: GET_ENTRIES_QUERY,
                    variables: {handle: blog.handle, first: 5, after: afterCursor},
                });

                const pageInfo = response.data?.blog.entries.pageInfo;
                const edges = response.data?.blog.entries.edges;
                afterCursor = pageInfo.endCursor;

                expect(edges.length).toBe(5);

                allEntries.push(...edges.map((edge: any) => edge.node));

                for (let j = 1; j < edges.length; j++) {
                    expect(new Date(edges[j - 1].node.updated).getTime())
                        .toBeGreaterThanOrEqual(new Date(edges[j].node.updated).getTime());
                }
            }

            for (let i = 1; i < allEntries.length; i++) {
                expect(new Date(allEntries[i - 1].updated).getTime())
                    .toBeGreaterThanOrEqual(new Date(allEntries[i].updated).getTime());
            }
        } finally {
            await conn.destroy();
        }
    });

    test('It can retrieve entry by ID', async () => {
        const {server, conn, userStore, blogStore, entryStore} = await initDataStorage();
        const user: User = await userStore.create(
            'test-user', 'test-user@example.com', 'dummy.png')
        const blog: Blog = await blogStore.create(user.id, 'bloghandle', 'Blog Name');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            const entryFetched = await getEntry(server, blog.handle, entry.id);
            expect(entryFetched.errors).toBeUndefined();
            expect(entryFetched.data?.message).toBeUndefined();
            expect(entryFetched.data?.blog.entry.content).toBe('entry 1 content');
            verifyDate(entryFetched.data?.blog.entry.created);
            verifyDate(entryFetched.data?.blog.entry.updated);
            expect(entryFetched.data?.blog.entry.updated).toBeDefined();
        } finally {
            await conn.destroy();
        }
    });

    test(`It can delete an entry`, async () => {
        const {server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            const itemFetched = await getEntry(server, blog.handle, entry.id);
            expect(itemFetched.errors).toBeUndefined();
            expect(itemFetched.data?.blog.entry.content).toBe('entry 1 content');

            const itemDeleted = await deleteEntry(server, blog.handle, entry.id);
            expect(itemDeleted.errors).toBeUndefined();
            expect(itemDeleted.data?.blog.entry.delete.id).toBe(entry.id);
        } finally {
            await conn.destroy();
        }
    });

    test('It prevents user from creating entries in somebody else blog', async () => {
        const {server, conn, blogStore, userStore} = await initDataStorage();
        try {
            const user: User = await userStore.create(
                'test-user', 'test-user@example.com', 'dummy.png')
            const blog: Blog = await blogStore.create(user.id, 'bloghandle', 'Blog Name');
            const entryCreated = await createEntry(server, blog.handle, 'First post!', 'LOL');
            expect(entryCreated.errors).toHaveLength(1);
        } finally {
            await conn.destroy();
        }
    });

    test(`It gives error when deleting entry that does not exist`, async () => {
        const {server, conn, blogStore, authUsers} = await initDataStorage();
        const id = uuid();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
        try {
            const entryDeleted = await deleteEntry(server, blog.handle, id);
            expect(entryDeleted.errors).toBeDefined();
        } finally {
            await conn.destroy();
        }
    });

    test(`It can update an entry's title and content and updated time`, async () => {
        const {server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            let entryFetched: GraphQLResponse = await getEntry(server, blog.handle, entry.id);
            expect(entryFetched.errors).toBeUndefined();
            expect(entryFetched.data?.blog.entry.content).toBe('entry 1 content');

            const entryUpdated = await updateEntry(
                server,
                blog.handle,
                entry.id,
                entry.title + ' (EDITED)',
                entry.content + ' (EDITED)');
            expect(entryUpdated.data?.blog.entry.update.id).toBe(entry.id);
            expect(entryUpdated.errors).toBeUndefined();

            entryFetched = await getEntry(server, blog.handle, entry.id);
            expect(entryFetched.errors).toBeUndefined();
            expect(entryFetched.data?.blog.entry.title).toBe('entry 1 title (EDITED)');
            expect(entryFetched.data?.blog.entry.content).toBe('entry 1 content (EDITED)');
        } finally {
            await conn.destroy();
        }
    });

    test('It can return limited blogs from the database', async () => {
        const limit = 2;
        const {server, conn, blogStore, authUsers} = await initDataStorage();
        await createTestBlogsViaSql(authUsers, blogStore);
        try {
            const result = await getBlogs(server, limit, undefined);
            expect(result.errors).toBeUndefined();
            expect(result.data?.blogs.edges).toHaveLength(limit);
        } finally {
            await conn.destroy();
        }
    });

    test('It can CRUD blogs', async () => {
        const {server, conn, authUsers} = await initDataStorage();

        try {
            const slug = randomString(5);

            // create a blog
            const blog = await createBlog(server, `test-blog-${slug}`, `Test Blog ${slug}`);
            expect(blog.errors).toBeUndefined();

            // get the blog
            const fetchedBlog = await getBlog(server, blog.data?.createBlog.handle);
            expect(fetchedBlog.errors).toBeUndefined();
            expect(fetchedBlog.data?.blog.name).toBe(`Test Blog ${slug}`);
            expect(fetchedBlog.data?.blog.handle).toBe(`test-blog-${slug}`);
            expect(fetchedBlog.data?.blog.userId).toBe(authUsers[0].id);
            expect(fetchedBlog.data?.blog.user.id).toBe(authUsers[0].id);

            // update the blog
            const updatedBlog = await updateBlog(server, blog?.data?.createBlog.handle, `Test Blog ${slug} - Updated`);
            expect(updatedBlog.errors).toBeUndefined();
            expect(updatedBlog.data?.blog.update.name).toBe(`Test Blog ${slug} - Updated`);

            // delete the blog
            const deletedBlog = await deleteBlog(server, blog?.data?.createBlog.handle);
            expect(deletedBlog.errors).toBeUndefined();

            // attempt to get blog should return null
            const deletedBlogFetched = await getBlog(server, blog.data?.createBlog.handle);
            expect(deletedBlogFetched.errors).toBeUndefined();
            expect(deletedBlogFetched.data?.blog).toBeNull();

        } finally {
            await conn.destroy();
        }
    });

    test('It can page through all blogs', async () => {
        const {server, conn, blogStore, authUsers} = await initDataStorage();
        await createTestBlogsViaSql(authUsers, blogStore);
        try {
            await testPageThroughBlogs(server, NUM_BLOGS, NUM_BLOGS);
            await testPageThroughBlogs(server, 1, NUM_BLOGS);
            await testPageThroughBlogs(server, 2, NUM_BLOGS);
            await testPageThroughBlogs(server, 10, NUM_BLOGS);
            await testPageThroughBlogs(server, NUM_BLOGS + 20, NUM_BLOGS);
        } finally {
            await conn.destroy();
        }
    });

    async function testPageThroughBlogs(server: ApolloServer, pageSize: number | null, expectedSize: number) {
        const payload = {query: GET_BLOGS_QUERY, variables: {first: pageSize}};
        const dataRetrieved: Blog[] = [];
        await getAllBlogs(server, payload, dataRetrieved);
        expect(dataRetrieved).toHaveLength(expectedSize);
    }

});

describe('Test random stuff', () => {

    test('Understand how dates are parsed', async () => {

        // valid RFC-3339 date strings
        let date1 = Date.parse('2020-07-01T12:16:58Z');
        expect(date1).toBeDefined();

        let date2 = Date.parse('2020-07-01T12:16:58-04:00');
        expect(date2).toBeDefined();

        let date3 = Date.parse('2020-07-01T12:16:58-0400');
        expect(date3).toBeDefined();

        // SQLite date string (Date can parse it but GraphQLDateTime does not like this format)
        // let date4 = Date.parse('2020-07-01 12:16:58 -0400');
        // expect(date4).toBeUndefined();
    });
});

// use cursor to recursively page through and fetch all entries
async function getAllEntries(server: ApolloServer, payload: any, dataRetrieved: Entry[]) {

    const result = await server.executeOperation(payload);
    expect(result?.errors).toBeUndefined();

    result.data?.blog.entries.edges.forEach((item: ResponseEdge<Entry>) => {
        dataRetrieved.push(item.node);
    });

    if (result.data?.blog.entries.pageInfo.hasNextPage) {
        payload.variables.after = result.data?.blog.entries.pageInfo.endCursor;
        await getAllEntries(server, payload, dataRetrieved);
    }
}

// use cursor to recursively page through and fetch all blogs
async function getAllBlogs(server: ApolloServer, payload: any, dataRetrieved: Blog[]) {

    const result = await server.executeOperation(payload);
    expect(result?.errors).toBeUndefined();

    result.data?.blogs.edges.forEach((item: ResponseEdge<Blog>) => {
        dataRetrieved.push(item.node);
    });

    if (result.data?.blogs.pageInfo.endCursor) {
        payload.variables.after = result.data?.blogs.pageInfo.endCursor;
        await getAllBlogs(server, payload, dataRetrieved);
    }
}

function verifyDate(dateString: string) {
    expect(dateString).toBeDefined();
    const date = new Date();
    date.setTime(Date.parse(dateString));
    expect(date.getFullYear()).toBeGreaterThan(2020);
}


