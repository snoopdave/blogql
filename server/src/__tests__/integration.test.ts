/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {EntryStore, Entry} from '../entrystore';
import {describe, expect, test} from '@jest/globals';
import {v4 as uuid} from 'uuid';
import {ApolloServer} from 'apollo-server';
import resolvers from '../resolvers';
import {randomString} from './userstore.test';
import BlogStore, {Blog} from '../blogstore';
import {GraphQLResponse} from 'apollo-server-types';
import {User, UserStore} from "../userstore";
import DBConnection from "../dbconnection";
import { readFileSync } from 'fs';
import {gql} from 'apollo-server';

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
        const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));
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
    const blog: Blog = await bs.create(user.id, 'bloghandle', 'Blog Name');
    const blogId = blog.id;
    for (let i = 0; i < 10; i++) {
        const entry: Entry = await es.create(blogId, 'Entry Title ' + i, 'Entry content' + i);
        es.publish(entry.id);
        expect(entry.id).toBeDefined();
    }
    return blog;
}

async function createTestBlogsViaSql(users: User[], bs: BlogStore): Promise<Blog[]> {
    const blogs: Blog[] = []
    for (let i = 0; i < users.length; i++) {
        const slug = randomString(5);
        blogs.push(await bs.create(users[i].id, `blog${slug}`, `Blog ${slug}`));
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
// GraphQL queries and mutations
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

async function getEntry(server: ApolloServer, handle: string, entryId: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: getEntryQuery, variables: {handle, id: entryId}});
}

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

async function createEntry(server: ApolloServer, handle: string, title: string, content: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: createEntryMutation, variables: {handle, title, content}});
}

const createEntryMutation = `mutation CreateEntry($handle: String!, $title: String!, $content: String!) { 
        blog(handle: $handle) {
            createEntry(title: $title, content: $content) {
                id
                title 
                content
                created
                updated
            }
        } 
    }`;

async function deleteEntry(server: ApolloServer, handle: string, id: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: deleteEntryMutation, variables: {handle, id}});
}

const deleteEntryMutation = `mutation DeleteEntry($handle: String!, $id: ID!) {
        blog(handle: $handle) {
            entry(id: $id) {
                delete {
                    id
                }
            } 
        }
    }`;

async function updateEntry(server: ApolloServer, handle: string, id: string, title: string, content: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: updateEntryMutation, variables: {handle, id, title, content}});
}

const updateEntryMutation = `mutation UpdateEntry($handle: String!, $id: ID!, $title: String!, $content: String!) { 
        blog(handle: $handle) {
            entry(id: $id) {
                update(title: $title, content: $content) {
                    id
                }
            }
        } 
    }`;

async function createBlog(server: ApolloServer, handle: string, name: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: createBlogMutation, variables: {handle, name}});
}

const createBlogMutation = `mutation CreateBlog($handle: String!, $name: String!) { 
        createBlog(handle: $handle, name: $name) {
            id
            handle
            name 
            created
            updated
        } 
    }`;

async function getBlog(server: ApolloServer, handle: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: getBlogQuery, variables: {handle}});
}

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

async function updateBlog(server: ApolloServer, handle: string, name: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: updateBlogMutation, variables: {handle, name}});
}

const updateBlogMutation = `mutation UpdateBlog($handle: String!, $name: String!) { 
        blog(handle: $handle) {
            update(name: $name) {
                id
                name
            }
        } 
    }`;

async function deleteBlog(server: ApolloServer, handle: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: deleteBlogMutation, variables: {handle}});
}

const deleteBlogMutation = `mutation DeleteBlog($handle: String!) { 
        blog(handle: $handle) {
            delete {
                id
            } 
        }
    }`;

async function getBlogs(server: ApolloServer, limit: number, cursor: string | undefined): Promise<GraphQLResponse> {
    return server.executeOperation({query: getBlogsQuery, variables: {limit, cursor}});
}

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

async function getBlogForUser(server: ApolloServer, userId: string): Promise<GraphQLResponse> {
    return server.executeOperation({query: getBlogForUserQuery, variables: {userId}});
}

const getBlogForUserQuery = `query getBlogForUser($userId: ID!) {
        blogForUser(userId: $userId) { 
           id
           handle 
           name 
           created
           updated
        }
    }`;


