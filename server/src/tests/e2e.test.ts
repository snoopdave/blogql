/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from '../entries/entry.js';
import {describe, expect, test} from '@jest/globals';
import {v4 as uuid} from 'uuid';
import resolvers from '../resolvers.js';
import {randomString} from "../utils/utils.js";
import {Blog} from '../blogs/blog.js';
import {User} from '../users/user.js';
import DBConnection from '../utils/dbconnection.js';
import {readFileSync} from 'fs';
import {BlogService, BlogServiceSequelizeImpl} from "../blogservice";
import {UserStore} from "../users/userstore";
import BlogStore from "../blogs/blogstore";
import {EntryStore} from "../entries/entrystore";
import {Cursor, PageInfo, ResponseConnection, ResponseEdge} from "../pagination";
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
import {ApolloServer, GraphQLResponse} from "@apollo/server";
import {BlogQLContext} from "../index";
import {startStandaloneServer} from "@apollo/server/standalone";
import gql from 'graphql-tag';

describe('Test the GraphQL API integration', () => {

    interface TestContext {
        server: ApolloServer<BlogQLContext>;
        conn: DBConnection;
        blogService: BlogService;
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
        const server = new ApolloServer<BlogQLContext>({
            typeDefs,
            resolvers
        });
        const user = authUsers[0];
        const blogService: BlogServiceSequelizeImpl = new BlogServiceSequelizeImpl(user, conn, null, null, null, null);
        await blogService.initDataSources();

        const { url } = await startStandaloneServer(server, {
            context: async ({req, res}) => {
                return { blogService, user }; // for some reason this is not used
            }
        });
        console.log(`🚀 server up at ${url}`);

        return {
            server,
            conn,
            blogService,
            userStore: blogService.userStore,
            blogStore: blogService.blogStore,
            entryStore: blogService.entryStore,
            authUsers
        };
    }

    test('It can get blog for a user', async () => {
        const {blogService, server, conn, authUsers} = await initDataStorage();
        const slug = randomString(5);
        const blog = await createBlog(server, `myblog${slug}`, `My Blog ${slug}`, { blogService, user: authUsers[0] });

        expect(blog.body).toEqual({
            kind: 'single',
            singleResult: {
                data: {
                    createBlog: {
                        id: expect.any(String),
                        name: `My Blog ${slug}`,
                        handle: `myblog${slug}`,
                        created: expect.any(Date),
                        updated: expect.any(Date),
                        userId: authUsers[0].id,
                        user: {
                            id: authUsers[0].id
                        }
                    }
                }
            }
        })

        try {
            let response = await getBlogForUser(server, authUsers[0].id, { blogService, user: authUsers[0] });
            expect(response.body).toEqual({
                kind: 'single',
                singleResult: {
                    data: {
                        blogForUser: {
                            id: blog.body.kind === 'single' ? (blog.body.singleResult?.data?.createBlog as {id: string}).id : undefined,
                            name: `My Blog ${slug}`,
                            handle: `myblog${slug}`,
                            created: expect.any(Date),
                            updated: expect.any(Date)
                        }
                    },
                    errors: undefined
                }
            });
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It can create new entries via GraphQL', async () => {
        const {blogService, server, conn, blogStore, authUsers} = await initDataStorage();
        try {
            const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
            const entryCreated = await createEntry(server, blog.handle, 'First post!', 'LOL', { blogService, user: authUsers[0] });
            expect(entryCreated.body).toEqual({
                kind: 'single',
                singleResult: {
                    data: {
                        blog: {
                            createEntry: {
                                id: expect.any(String),
                                title: 'First post!',
                                content: 'LOL',
                                created: expect.any(Date),
                                updated: expect.any(Date)
                            }
                        }
                    },
                    errors: undefined
                }
            });
            if (entryCreated.body.kind === 'single') {
                verifyDate((entryCreated.body.singleResult?.data?.blog as { createEntry: { created: string }}).createEntry?.created);
                verifyDate((entryCreated.body.singleResult?.data?.blog as { createEntry: { updated: string }}).createEntry?.updated);
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It can return limited blog entries from the database', async () => {
        const limit = 2;
        const {blogService, server, conn, blogStore, authUsers} = await initDataStorage();
        await createTestBlogsViaSql(authUsers, blogStore);
        try {
            const result = await getBlogs(server, limit, undefined, { blogService, user: authUsers[0] });
            expect(result.body).toEqual({
                kind: 'single',
                singleResult: {
                    data: {
                        blogs: {
                            edges: expect.arrayContaining([
                                {
                                    node: {
                                        id: expect.any(String),
                                        handle: expect.any(String),
                                        name: expect.any(String),
                                        created: expect.any(Date),
                                        updated: expect.any(Date)
                                    },
                                    cursor: expect.any(String)
                                }
                            ]),
                            pageInfo: {
                                startCursor: expect.any(String),
                                endCursor: expect.any(String),
                                hasNextPage: true,
                                hasPreviousPage: false,
                                totalCount: NUM_ENTRIES,
                            }
                        }
                    },
                    errors: undefined
                }
            });
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It can page through all entries', async () => {
        const {blogService, server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);
        const blogQLContext: BlogQLContext = {blogService, user: authUsers[0]};
        try {
            await testPageThroughEntries(server, blog.handle, NUM_ENTRIES, NUM_ENTRIES, blogQLContext);
            await testPageThroughEntries(server, blog.handle, 1, NUM_ENTRIES, blogQLContext);
            await testPageThroughEntries(server, blog.handle, 2, NUM_ENTRIES, blogQLContext);
            await testPageThroughEntries(server, blog.handle, 10, NUM_ENTRIES, blogQLContext);
            await testPageThroughEntries(server, blog.handle, NUM_ENTRIES + 20, NUM_ENTRIES, blogQLContext);
        } finally {
            await conn.destroy();
            await server.stop();
        }
    }, 20000); // timeout for long running test


    async function testPageThroughEntries(server: ApolloServer<BlogQLContext>, handle: string, pageSize: number | null, expectedSize: number, blogQLContext: BlogQLContext) {
        const payload = {query: GET_ENTRIES_QUERY, variables: { handle, first: pageSize}};
        const dataRetrieved: Entry[] = [];
        await getAllEntries(server, payload, dataRetrieved, blogQLContext);
        expect(dataRetrieved).toHaveLength(expectedSize);
    }


    it('should fetch all 100 entries in reverse chronological order', async () => {
        const {blogService, conn, server, blogStore, entryStore, authUsers} = await initDataStorage();
        try {
            const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);

            const response = await server.executeOperation({
                query: GET_ENTRIES_QUERY,
                variables: {handle: blog.handle, first: NUM_ENTRIES},
            }, { contextValue: { blogService, user: authUsers[0] } });

            if (response.body.kind  === 'single') {
                expect(response.body.singleResult?.errors).toBeUndefined();

                const entries = (response.body.singleResult.data?.blog as { entries: ResponseConnection<ResponseEdge<Entry>> }).entries.edges;
                expect(entries.length).toBe(NUM_ENTRIES);
                for (let i = 1; i < entries.length; i++) {
                    expect(new Date(entries[i - 1].node.updated).getTime())
                        .toBeGreaterThanOrEqual(new Date(entries[i].node.updated).getTime());
                }
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    it('should paginate forward 5 items at a time in reverse chronological order', async () => {
        const {blogService, conn, server, blogStore, entryStore, authUsers} = await initDataStorage();
        try {
            const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);

            let afterCursor = null;
            const allEntries: any[] = [];

            for (let i = 0; i < 20; i++) {
                const response: GraphQLResponse = await server.executeOperation({
                    query: GET_ENTRIES_QUERY,
                    variables: {handle: blog.handle, first: 5, after: afterCursor},
                }, { contextValue: { blogService, user: authUsers[0] } });

                if (response.body.kind === 'single') {
                    expect(response.body.singleResult?.errors).toBeUndefined();

                    const pageInfo= (response.body.singleResult.data?.blog as { entries: ResponseConnection<ResponseEdge<Entry>> }).entries.pageInfo;
                    afterCursor = pageInfo.endCursor;

                    const edges= (response.body.singleResult.data?.blog as { entries: ResponseConnection<ResponseEdge<Entry>> }).entries.edges;
                    expect(edges.length).toBe(5);

                    allEntries.push(...edges.map((edge: any) => edge.node));

                    // check that entries in this page are ordered
                    for (let j = 1; j < edges.length; j++) {
                        expect(new Date(edges[j - 1].node.updated).getTime())
                            .toBeGreaterThanOrEqual(new Date(edges[j].node.updated).getTime());
                    }
                }

            }

            // check that all pages taken together are ordered
            for (let i = 1; i < allEntries.length; i++) {
                expect(new Date(allEntries[i - 1].updated).getTime())
                    .toBeGreaterThanOrEqual(new Date(allEntries[i].updated).getTime());
            }

        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It can retrieve entry by ID', async () => {
        const {blogService, server, conn, userStore, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            const entryFetched = await getEntry(server, blog.handle, entry.id, { blogService, user: authUsers[0] });
            if (entryFetched.body.kind  === 'single') {
                expect(entryFetched.body.singleResult?.errors).toBeUndefined();
                const fetchedEntry = (entryFetched.body.singleResult?.data?.blog as { entry: Entry }).entry;
                expect(fetchedEntry).toEqual({
                    id: entry.id,
                    title: entry.title,
                    content: entry.content,
                    created: entry.created,
                    updated: entry.updated,
                });
                expect(entryFetched.body.singleResult.data?.message).toBeUndefined();
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test(`It can delete an entry`, async () => {
        const {blogService, server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            const itemFetched = await getEntry(server, blog.handle, entry.id, { blogService, user: authUsers[0] });
            if (itemFetched.body.kind  === 'single') {
                expect(itemFetched.body.singleResult.errors).toBeUndefined();
                expect((itemFetched.body.singleResult.data?.blog as { entry: Entry }).entry.content).toBe('entry 1 content');
            }

            const itemDeleted = await deleteEntry(server, blog.handle, entry.id, { blogService, user: authUsers[0] });
            if (itemDeleted.body.kind  === 'single') {
                expect(itemDeleted.body.singleResult.errors).toBeUndefined();
                expect((itemDeleted.body.singleResult.data?.blog as { entry: { delete: Entry }}).entry.delete.id).toBe(entry.id);
            }

        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It prevents user from creating entries in somebody else blog', async () => {
        const {blogService, server, conn, blogStore, userStore, authUsers} = await initDataStorage();
        try {
            const user: User = await userStore.create(
                'test-user', 'test-user@example.com', 'dummy.png')
            const blog: Blog = await blogStore.create(user.id, 'bloghandle', 'Blog Name');
            const entryCreated = await createEntry(server, blog.handle, 'First post!', 'LOL', { blogService, user: authUsers[0] });
            if (entryCreated.body.kind  === 'single') {
                expect(entryCreated.body.singleResult.errors).toBeDefined();
                expect(entryCreated.body.singleResult?.errors).toHaveLength(1);
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test(`It gives error when deleting entry that does not exist`, async () => {
        const {blogService, server, conn, blogStore, authUsers} = await initDataStorage();
        const id = uuid();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
        try {
            const entryDeleted = await deleteEntry(server, blog.handle, id, { blogService, user: authUsers[0] });
            if (entryDeleted.body.kind  === 'single') {
                expect(entryDeleted.body.singleResult.errors).toBeDefined();
                expect(entryDeleted.body.singleResult?.errors).toHaveLength(1);
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test(`It can update an entry's title and content and updated time`, async () => {
        const {blogService, server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'bloghandle', 'Blog Name');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            let entryFetched: GraphQLResponse = await getEntry(server, blog.handle, entry.id, { blogService, user: authUsers[0] });
            if (entryFetched.body.kind  === 'single') {
                expect(entryFetched.body.singleResult.errors).toBeUndefined();
                expect((entryFetched.body.singleResult.data?.blog as { entry: Entry }).entry.content).toBe('entry 1 content');
            }

            const entryUpdatedResponse = await updateEntry(
                server,
                blog.handle,
                entry.id,
                entry.title + ' (EDITED)',
                entry.content + ' (EDITED)', { blogService, user: authUsers[0] });
            if (entryUpdatedResponse.body.kind  === 'single') {
                expect(entryUpdatedResponse.body.singleResult.errors).toBeUndefined();

                const entryUpdated = (entryUpdatedResponse.body.singleResult.data?.blog as {
                    entry: { update: {id: string} }
                }).entry;
                expect(entryUpdated.update.id).toBe(entry.id);

                const entryReFetchedResponse  = await getEntry(server, blog.handle, entry.id, { blogService, user: authUsers[0] });
                if (entryReFetchedResponse.body.kind  === 'single') {
                    expect(entryReFetchedResponse.body.singleResult.errors).toBeUndefined();
                    const entryRefetched: Entry = (entryReFetchedResponse.body.singleResult.data?.blog as {
                        entry: Entry
                    }).entry;
                    expect(entryRefetched.title).toBe('entry 1 title (EDITED)');
                    expect(entryRefetched.content).toBe('entry 1 content (EDITED)');
                }
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It can return limited blogs from the database', async () => {
        const limit = 2;
        const {blogService, server, conn, blogStore, authUsers} = await initDataStorage();
        await createTestBlogsViaSql(authUsers, blogStore);
        try {
            const result = await getBlogs(server, limit, undefined, { blogService, user: authUsers[0] });
            if (result.body.kind === 'single') {
                expect(result.body.singleResult.errors).toBeUndefined();
                expect((result.body.singleResult.data?.blogs as { edges: ResponseEdge<Blog>[] }).edges).toHaveLength(limit);
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It can CRUD blogs', async () => {
        const {blogService, server, conn, authUsers} = await initDataStorage();

        try {
            const slug = randomString(5);

            // create a blog
            const blogResponse = await createBlog(server, `test-blog-${slug}`, `Test Blog ${slug}`, { blogService, user: authUsers[0] });
            if (blogResponse.body.kind === 'single') {
                expect(blogResponse.body.singleResult.errors).toBeUndefined();

                // get the blog
                const blog = (blogResponse.body.singleResult.data?.createBlog as Blog);
                expect(blog).toEqual({
                    id: expect.any(String),
                    handle: `test-blog-${slug}`,
                    name: `Test Blog ${slug}`,
                    created: expect.any(Date),
                    updated: expect.any(Date),
                    userId: authUsers[0].id,
                    user: {
                        id: authUsers[0].id
                    }
                });

                const fetchedBlogResponse = await getBlog(server, blog.handle, { blogService, user: authUsers[0] });
                if (fetchedBlogResponse.body.kind === 'single') {
                    expect(fetchedBlogResponse.body.singleResult.errors).toBeUndefined();

                    const fetchedBlog = fetchedBlogResponse.body.singleResult.data?.blog as Blog;
                    expect(fetchedBlog).toEqual({
                        id: blog.id,
                        handle: `test-blog-${slug}`,
                        name: `Test Blog ${slug}`,
                        created: expect.any(Date),
                        updated: expect.any(Date),
                        userId: authUsers[0].id,
                        user: {
                            id: authUsers[0].id
                        }
                    });

                    // update the blog
                    const updatedBlog = await updateBlog(server, blog.handle, `Test Blog ${slug} - Updated`, { blogService, user: authUsers[0] });
                    if (updatedBlog.body.kind === 'single') {
                        expect(updatedBlog.body.singleResult.errors).toBeUndefined();
                        expect((updatedBlog.body.singleResult.data?.blog as { update: Blog }).update).toEqual({
                            id: blog.id,
                            name: `Test Blog ${slug} - Updated`,
                        });
                    }

                    // delete the blog
                    const deletedBlog = await deleteBlog(server, blog.handle, { blogService, user: authUsers[0] });
                    if (deletedBlog.body.kind === 'single') {
                        expect(deletedBlog.body.singleResult.errors).toBeUndefined();
                    }

                    // attempt to get blog should return null
                    const deletedBlogFetched = await getBlog(server, blog.handle, { blogService, user: authUsers[0] });
                    if (deletedBlogFetched.body.kind === 'single') {
                        expect(deletedBlogFetched.body.singleResult.errors).toBeUndefined();
                        expect(deletedBlogFetched.body.singleResult.data?.blog).toBeNull();
                    }
                }
            }
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    test('It can page through all blogs', async () => {
        const {blogService, server, conn, blogStore, authUsers} = await initDataStorage();
        await createTestBlogsViaSql(authUsers, blogStore);
        const blogQLContext: BlogQLContext = {blogService, user: authUsers[0]};
        try {
            await testPageThroughBlogs(server, NUM_BLOGS, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogs(server, 10, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogs(server, 1, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogs(server, 2, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogs(server, NUM_BLOGS + 20, NUM_BLOGS, blogQLContext);
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    async function testPageThroughBlogs(server: ApolloServer<BlogQLContext>, pageSize: number, expectedSize: number, blogQLContext: BlogQLContext) {
        const payload = {query: GET_BLOGS_QUERY, variables: {first: pageSize}};
        const dataRetrieved: Blog[] = [];
        await getAllBlogs(server, payload, dataRetrieved, blogQLContext);
        expect(dataRetrieved).toHaveLength(expectedSize);
    }

    test('It can page through blogs in reverse', async () => {
        // create authUsers as done in 'page through all blogs above
        // call a new function testPageThroughBlogsInReverse() to test wih different last and before values
        const {blogService, server, conn, blogStore, authUsers} = await initDataStorage();
        await createTestBlogsViaSql(authUsers, blogStore);
        const blogQLContext: BlogQLContext = {blogService, user: authUsers[0]};
        try {
            await testPageThroughBlogsInReverse(server, NUM_BLOGS, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogsInReverse(server, 10, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogsInReverse(server, 1, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogsInReverse(server, 2, NUM_BLOGS, blogQLContext);
            await testPageThroughBlogsInReverse(server, NUM_BLOGS + 20, NUM_BLOGS, blogQLContext);
        } finally {
            await conn.destroy();
            await server.stop();
        }
    });

    async function testPageThroughBlogsInReverse(server: ApolloServer<BlogQLContext>, pageSize: number, expectedSize: number, blogQLContext: BlogQLContext) {
        const endCursor = new Cursor(pageSize, NUM_BLOGS);
        const encodedCursor = endCursor.encode();
        const payload = {query: GET_BLOGS_QUERY, variables: {last: pageSize, before: encodedCursor}};
        const dataRetrieved: Blog[] = [];
        await getAllBlogsInReverse(server, payload, dataRetrieved, blogQLContext);
        expect(dataRetrieved).toHaveLength(expectedSize);
    }

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
});


// use cursor to recursively page through and fetch all entries
async function getAllEntries(server: ApolloServer<BlogQLContext>, payload: any, dataRetrieved: Entry[], blogQLContext: BlogQLContext) {

    const result = await server.executeOperation(payload, { contextValue: blogQLContext });
    expect(result.body.kind === 'single');
    if (result.body.kind === 'single') {
        expect(result?.body.singleResult.errors).toBeUndefined();

        // expect pageInfo.totalCount to be equal to NUM_ENTRIES
        expect((result?.body.singleResult.data?.blog as { entries: { edges: [], pageInfo: PageInfo }} )
            .entries.pageInfo.totalCount).toBe(NUM_ENTRIES);

        expect((result?.body.singleResult.data?.blog as {entries: {edges: ResponseEdge<Entry>[]}}).entries.edges).toBeDefined();
        (result.body.singleResult.data?.blog as {entries: {edges: ResponseEdge<Entry>[]}}).entries.edges
            .forEach((item: ResponseEdge<Entry>) => {
                dataRetrieved.push(item.node);
            });

        if ((result.body.singleResult?.data?.blog as {entries: {pageInfo: {hasNextPage: boolean}}}).entries.pageInfo.hasNextPage) {
            payload.variables.after = (result.body.singleResult?.data?.blog as {entries: {pageInfo: {endCursor: string}}}).entries.pageInfo.endCursor;
            await getAllEntries(server, payload, dataRetrieved, blogQLContext);
        }
    }
}

interface BlogData {
    edges: ResponseEdge<Blog>[];
    pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string;
        endCursor: string;
        totalCount: number;
    }
}

function hasMore(blogData: BlogData) {
    return blogData.pageInfo.hasNextPage && blogData.pageInfo.endCursor;
}

function hasPrev(blogData: BlogData) {
    return blogData.pageInfo.hasPreviousPage && blogData.pageInfo.startCursor;
}

// use cursor to recursively page through and fetch all blogs
async function getAllBlogs(server: ApolloServer<BlogQLContext>, payload: any, dataRetrieved: Blog[], blogQLContext: BlogQLContext) {

    const result = await server.executeOperation(payload, { contextValue: blogQLContext });
    expect(result.body.kind === 'single');

    if (result.body.kind === 'single') {
        expect(result?.body.singleResult.errors).toBeUndefined();

        const {data} = result.body.singleResult;
        const blogData = data?.blogs as BlogData;

        if (blogData) {
            blogData.edges.forEach(edge => {
                dataRetrieved.push(edge.node);
            });
        }

        expect(blogData.pageInfo.totalCount).toBe(NUM_BLOGS);

        if (hasMore(blogData)) {
            payload.variables.after = blogData.pageInfo.endCursor;
            await getAllBlogs(server, payload, dataRetrieved, blogQLContext);
        }
    }
}

async function getAllBlogsInReverse(server: ApolloServer<BlogQLContext>, payload: any, dataRetrieved: Blog[], blogQLContext: BlogQLContext) {

    const result = await server.executeOperation(payload, { contextValue: blogQLContext });
    expect(result.body.kind === 'single');

    if (result.body.kind === 'single') {
        expect(result?.body.singleResult.errors).toBeUndefined();

        const {data} = result.body.singleResult;
        const blogData = data?.blogs as BlogData;

        if (blogData) {
            blogData.edges.forEach(edge => {
                dataRetrieved.push(edge.node);
            });
        }

        if (hasPrev(blogData)) {
            payload.variables.before = blogData.pageInfo.startCursor;
            await getAllBlogsInReverse(server, payload, dataRetrieved, blogQLContext);
        }
    }
}

function verifyDate(dateString: string) {
    expect(dateString).toBeDefined();
    const date = new Date();
    date.setTime(Date.parse(dateString));
    expect(date.getFullYear()).toBeGreaterThan(2020);
}

