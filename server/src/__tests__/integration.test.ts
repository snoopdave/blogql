/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import EntryStore, {Entry} from '../entrystore.js';
import {describe, expect, test} from '@jest/globals';
import {v4 as uuid} from 'uuid';
import UserStore, {User} from '../userstore.js';
import DBConnection from '../dbconnection.js';
import {ApolloServer} from 'apollo-server';
import resolvers from '../resolvers';
import {randomString} from './userstore.test';
import BlogStore, {Blog} from '../blogstore';
import type {GraphQLResponse} from 'apollo-server-types';
import {typeDefs} from '../index';

describe('Test the GraphQL API integration', () => {

    interface TextContext {
        server: ApolloServer;
        conn: DBConnection;
        userStore: UserStore;
        blogStore: BlogStore;
        entryStore: EntryStore;
        authUsers: User[];
    }

    async function initDataStorage(): Promise<TextContext> {
        const conn = new DBConnection(`./db-test-${randomString(5)}.db`);
        const userStore = new UserStore(conn);
        await userStore.init();
        let authUsers: User[] = [];
        for (let i = 0; i < 10; i++) {
            const slug = randomString(5);
            authUsers.push(await userStore.create(
                `test-user-${slug}`,
                `test-user-${slug}@example.com`,
                'dummy.png'));
        }
        const blogStore = new BlogStore(conn);
        await blogStore.init();
        const entryStore = new EntryStore(conn);
        await entryStore.init();
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            dataSources: () => ({
                userStore, blogStore, entryStore
            }),
            context: () => {
                return {user: authUsers[0]}
            }
        });
        return {server, conn, userStore, blogStore, entryStore, authUsers};
    }

    test('It can create new entries via GraphQL', async () => {
        const {server, conn, blogStore, authUsers} = await initDataStorage();
        try {
            const blog: Blog = await blogStore.create(authUsers[0].id, 'Blog Name', 'bloghandle');
            const entryCreated = await createEntry(server, blog.id, 'First post!', 'LOL');
            expect(entryCreated.errors).toBeUndefined();
            expect(entryCreated.data?.createEntry.title).toBe('First post!')
            verifyDate(entryCreated.data?.createEntry.created);
            verifyDate(entryCreated.data?.createEntry.updated);
        } finally {
            await conn.destroy();
        }
    });

    test('It can return limited blog entries from the database', async () => {
        const limit = 2;
        const {server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);
        let payload = {query: getEntriesQuery, variables: {handle: blog.handle, limit}};
        try {
            const result = await server.executeOperation(payload);
            expect(result.errors).toBeUndefined();
            expect(result.data?.blog.entries.nodes).toHaveLength(limit);
            expect(result.data?.blog.entries.pageInfo.totalCount).toBe(authUsers.length);
        } finally {
            await blogStore.delete(blog.id);
            await conn.destroy();
        }
    });

    test('It can page through all entries', async () => {
        const {server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog = await createBlogAndTestEntriesViaSql(authUsers[0], blogStore, entryStore);
        const payload = {query: getEntriesQuery, variables: {handle: blog.handle, limit: 2}};
        const dataRetrieved: Entry[] = [];
        try {
            await getAllEntries(server, payload, dataRetrieved);
            expect(dataRetrieved).toHaveLength(authUsers.length);
        } finally {
            await blogStore.delete(blog.id);
            await conn.destroy();
        }
    });

    test('It can retrieve entry by ID', async () => {
        const {server, conn, userStore, blogStore, entryStore} = await initDataStorage();
        const user: User = await userStore.create(
            'test-user', 'test-user@example.com', 'dummy.png')
        const blog: Blog = await blogStore.create(user.id, 'Blog Name', 'bloghandle');
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
        const blog: Blog = await blogStore.create(authUsers[0].id, 'Blog Name', 'bloghandle');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            const itemFetched = await getEntry(server, blog.handle, entry.id);
            expect(itemFetched.errors).toBeUndefined();
            expect(itemFetched.data?.blog.entry.content).toBe('entry 1 content');

            const itemDeleted = await deleteEntry(server, entry.id);
            expect(itemDeleted.errors).toBeUndefined();
            expect(itemDeleted.data?.deleteEntry.id).toBe(entry.id);
        } finally {
            await conn.destroy();
        }
    });

    test('It prevents user from creating entries in somebody else blog', async () => {
        const {server, conn, blogStore, userStore} = await initDataStorage();
        try {
            const user: User = await userStore.create(
                'test-user', 'test-user@example.com', 'dummy.png')
            const blog: Blog = await blogStore.create(user.id, 'Blog Name', 'bloghandle');
            const entryCreated = await createEntry(server, blog.id, 'First post!', 'LOL');
            expect(entryCreated.errors).toHaveLength(1);
        } finally {
            await conn.destroy();
        }
    });

    test(`It gives error when deleting entry that does not exist`, async () => {
        const {server, conn} = await initDataStorage();
        const id = uuid();
        try {
            const entryDeleted = await deleteEntry(server, id);
            expect(entryDeleted.errors).toBeDefined();
        } finally {
            await conn.destroy();
        }
    });

    test(`It can update an entry's title and content and updated time`, async () => {
        const {server, conn, blogStore, entryStore, authUsers} = await initDataStorage();
        const blog: Blog = await blogStore.create(authUsers[0].id, 'Blog Name', 'bloghandle');
        const entry = await entryStore.create(blog.id, 'entry 1 title', 'entry 1 content');
        try {
            let entryFetched: GraphQLResponse = await getEntry(server, blog.handle, entry.id);
            expect(entryFetched.errors).toBeUndefined();
            expect(entryFetched.data?.blog.entry.content).toBe('entry 1 content');

            const entryUpdated = await updateEntry(
                server,
                entry.id,
                entry.title + ' (EDITED)',
                entry.content + ' (EDITED)');
            expect(entryUpdated.data?.updateEntry.id).toBe(entry.id);
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
        let payload = {query: getBlogsQuery, variables: {limit}};
        try {
            const result = await server.executeOperation(payload);
            expect(result.errors).toBeUndefined();
            expect(result.data?.blogs.nodes).toHaveLength(limit);
            expect(result.data?.blogs.pageInfo.totalCount).toBe(authUsers.length);
        } finally {
            await conn.destroy();
        }
    });

    test('It can CRUD blogs', async () => {
        const {server, conn, authUsers} = await initDataStorage();

        try {
            const slug = randomString(5);

            // create a blog
            const createBlogPayload = {
                query: createBlogMutation, variables: {
                    name: `Test Blog ${slug}`,
                    handle: `test-blog-${slug}`,
                }
            };
            const blog = await server.executeOperation(createBlogPayload);
            expect(blog.errors).toBeUndefined();

            // get the blog
            const getBlogPayload = {query: getBlogQuery, variables: {handle: blog.data?.createBlog.handle}};
            const fetchedBlog = await server.executeOperation(getBlogPayload);
            expect(fetchedBlog.errors).toBeUndefined();
            expect(fetchedBlog.data?.blog.name).toBe(`Test Blog ${slug}`);
            expect(fetchedBlog.data?.blog.handle).toBe(`test-blog-${slug}`);
            expect(fetchedBlog.data?.blog.userId).toBe(authUsers[0].id);
            expect(fetchedBlog.data?.blog.user.id).toBe(authUsers[0].id);

            // update the blog
            const updateBlogPayload = {
                query: updateBlogMutation, variables: {
                    id: blog?.data?.createBlog.id,
                    name: `Test Blog ${slug} - Updated`,
                }
            };
            const updatedBlog = await server.executeOperation(updateBlogPayload);
            expect(updatedBlog.errors).toBeUndefined();
            expect(updatedBlog.data?.updateBlog.name).toBe(`Test Blog ${slug} - Updated`);

            // delete the blog
            const deleteBlogPayload = {
                query: deleteBlogMutation, variables: {
                    id: blog?.data?.createBlog.id,
                }
            };
            const deletedBlog = await server.executeOperation(deleteBlogPayload);
            expect(deletedBlog.errors).toBeUndefined();

            // attempt to get blog should return null
            const getDeletedBlogPayload = {query: getBlogQuery, variables: {handle: blog?.data?.createBlog.handle}};
            const deletedBlogFetched = await server.executeOperation(getDeletedBlogPayload);
            expect(deletedBlogFetched.errors).toBeUndefined();
            expect(deletedBlogFetched.data?.blog).toBeNull();

        } finally {
            await conn.destroy();
        }
    });

    test('It can page through all blogs', async () => {
        const {server, conn, blogStore, authUsers} = await initDataStorage();
        await createTestBlogsViaSql(authUsers, blogStore);
        const payload = {query: getBlogsQuery, variables: {limit: 2}};
        const dataRetrieved: Entry[] = [];
        try {
            await getAllBlogs(server, payload, dataRetrieved);
            expect(dataRetrieved).toHaveLength(authUsers.length);
        } finally {
            await conn.destroy();
        }
    });

    test('It can get blog for a user', async () => {
        const {server, conn, blogStore, authUsers} = await initDataStorage();
        const slug = randomString(5);
        const blog = await createBlog(server, `My Blog ${slug}`, `myblog${slug}`);
        blog?.data?.createBlog.id;
        const payload = {query: getBlogForUser, variables: {userId: authUsers[0].id}};
        try {
            let data = await server.executeOperation(payload);
            expect(data.errors).toBeUndefined();
            expect(data?.data?.blogForUser?.id).toBe(blog?.data?.createBlog.id);
        } finally {
            await conn.destroy();
        }
    });
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

    result.data?.blog.entries.nodes.forEach((item: Entry) => {
        dataRetrieved.push(item);
    });

    if (result.data?.blog.entries.pageInfo.cursor) {
        const newPayload = {
            query: payload.query,
            variables: {
                limit: payload.variables.limit,
                cursor: result.data?.blog.entries.pageInfo.cursor,
                handle: payload.variables.handle
            }
        };
        await getAllEntries(server, newPayload, dataRetrieved);
    }
}

// use cursor to recursively page through and fetch all blogs
async function getAllBlogs(server: ApolloServer, payload: any, dataRetrieved: Entry[]) {
    const result = await server.executeOperation(payload);
    expect(result?.errors).toBeUndefined();

    result.data?.blogs.nodes.forEach((item: Entry) => {
        dataRetrieved.push(item);
    });

    if (result.data?.blogs.pageInfo.cursor) {
        const newPayload = {
            query: payload.query,
            variables: {
                limit: payload.variables.limit,
                cursor: result.data?.blogs.pageInfo.cursor,
                handle: payload.variables.handle
            }
        };
        await getAllBlogs(server, newPayload, dataRetrieved);
    }
}

async function createBlogAndTestEntriesViaSql(user: User, bs: BlogStore, es: EntryStore): Promise<Blog> {
    const blog: Blog = await bs.create(user.id, 'Blog Name', 'bloghandle');
    const blogId = blog.id;
    for (let i = 0; i < 10; i++) {
        const entry: Entry = await es.create(blogId, 'Entry Title ' + i, 'Entry content' + i);
        expect(entry.id).toBeDefined();
    }
    return blog;
}

async function createTestBlogsViaSql(users: User[], bs: BlogStore): Promise<Blog[]> {
    const blogs: Blog[] = []
    for (let i = 0; i < users.length; i++) {
        const slug = randomString(5);
        blogs.push(await bs.create(users[i].id, `Blog ${slug}`, `blog${slug}`));
    }
    return blogs;
}

function verifyDate(dateString: string) {
    expect(dateString).toBeDefined();
    const date = new Date();
    date.setTime(Date.parse(dateString));
    expect(date.getFullYear()).toBeGreaterThan(2020);
}

//
// GraphQL CRUD methods
//

async function createEntry(server: ApolloServer, blogId: string, title: string, content: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: createEntryMutation, variables: {blogId, title, content}});
}

async function updateEntry(server: ApolloServer, id: string, title: string, content: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: updateEntryMutation, variables: {id, title, content}});
}

async function getEntry(server: ApolloServer, handle: string, entryId: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: getEntryQuery, variables: {handle: handle, id: entryId}});
}

async function deleteEntry(server: ApolloServer, id: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: deleteEntryMutation, variables: {id}});
}

async function createBlog(server: ApolloServer, name: string, handle: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: createBlogMutation, variables: {handle, name}});
}

//
// GraphQL CRUD queries
//

const getEntriesQuery = `
        query getBlogEntries($handle: String!, $limit: Int, $cursor: String) {
            blog(handle: $handle) {
                entries(limit: $limit, cursor: $cursor) { 
                    nodes { 
                        id
                        title
                        content
                        created
                        updated
                    }
                    pageInfo {
                        totalCount
                        cursor
                    } 
                }
            }
        }`;

const getEntryQuery = `query getEntry($handle: String!, $id: ID!) {
        blog(handle: $handle) {
          entry(id: $id) {
            id
            title 
            content
            created
            updated
          }  
        } 
    }`;

const createEntryMutation = `mutation CreateEntry($blogId: ID!, $title: String!, $content: String!) { 
        createEntry(blogId: $blogId, title: $title, content: $content) {
            id
            title 
            content
            created
            updated
        } 
    }`;

const deleteEntryMutation = `mutation DeleteEntry($id: ID!) {
        deleteEntry(id: $id) {
            id
        } 
    }`;

const updateEntryMutation = `mutation UpdateEntry($id: ID!, $title: String!, $content: String!) { 
        updateEntry(id: $id, title: $title, content: $content) {
            id
        } 
    }`;

const createBlogMutation = `mutation CreateBlog($handle: String!, $name: String!) { 
        createBlog(handle: $handle, name: $name) {
            id
            name 
            handle
            created
            updated
        } 
    }`;

const getBlogQuery = `query getBlog($handle: String!) {
        blog(handle: $handle) {
            id
            name 
            handle
            created
            updated
            userId
            user {
                id
            }
        } 
    }`;

const updateBlogMutation = `mutation UpdateBlog($id: ID!, $name: String!) { 
        updateBlog(id: $id, name: $name) {
            id
            name
        } 
    }`;

const deleteBlogMutation = `mutation DeleteBlog($id: ID!) { 
        deleteBlog(id: $id) {
            id
        } 
    }`;

const getBlogsQuery = `query getBlogs($limit: Int, $cursor: String) {
        blogs(limit: $limit, cursor: $cursor) { 
            nodes { 
                id
                handle 
                name 
                created
                updated
            }
            pageInfo {
                totalCount
                cursor
            } 
        }
    }`;

const getBlogForUser = `query getBlogForUser($userId: ID!) {
        blogForUser(userId: $userId) { 
           id
           handle 
           name 
           created
           updated
        }
    }`;


