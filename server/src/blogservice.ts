/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Blog} from './blogs/blog.js';
import {Entry} from './entries/entry.js';
import {User} from './users/user.js';
import {Node} from './types/node.js';
import {Cursor, resolveCollection, ResponseConnection, ResponseEdge} from './pagination.js';
import {DEBUG, log} from "./utils.js";
import DBConnection from "./dbconnection.js";
import {ApiKeyStore} from "./apikeys/apikeystore.js";
import BlogStore from "./blogs/blogstore.js";
import {EntryStore} from "./entries/entrystore.js";
import {UserStore} from "./users/userstore.js";
import {GraphQLError} from "graphql/error/GraphQLError.js"; // this is an annoying one

export interface BlogService {

    // query

    getBlogForUser(userId: string): Promise<Blog | null>;
    getBlog(handle: string): Promise<Blog | null>;
    getBlogById(id: string): Promise<Blog | null>;
    getBlogs(first: number, last: number, before: string, after: string):
        Promise<ResponseConnection<ResponseEdge<Blog>>>;

    // blog

    getEntry(blog: Blog, id: string): Promise<Entry | null>;
    getUser(blog: Blog, id: string): Promise<User | null>;
    getEntries(blog: Blog, first: number, last: number, before: string, after: string):
        Promise<ResponseConnection<ResponseEdge<Entry>>>;
    getDrafts(blog: Blog, first: number, last: number, before: string, after: string):
        Promise<ResponseConnection<ResponseEdge<Entry>>>;

    // mutation

    createEntry(blogId: string, title: string, content: string): Promise<Entry>;
    publishEntry(id: string): Promise<Entry | null>;
    updateEntry(id: string, title: string, content: string): Promise<Entry | null>;
    deleteEntry(id: string): Promise<Node>;

    createBlog(handle: string, name: string): Promise<Blog>;
    updateBlog(id: string, name: string): Promise<Blog | null>;
    deleteBlog(id: string): Promise<Node>;
    issueApiKey(): Promise<string | null>;

    initDataSources(): void;
}

export class BlogServiceSequelizeImpl implements BlogService {

    user: User | null;

    blogStore: BlogStore;
    entryStore: EntryStore;
    userStore: UserStore;
    apiKeyStore: ApiKeyStore;

    constructor(user: User | null, conn: DBConnection,
                blogStore: BlogStore | null, entryStore: EntryStore | null, userStore: UserStore | null, apiKeyStore: ApiKeyStore | null) {
        this.user = user;
        this.blogStore = blogStore ?? new BlogStore(conn);
        this.entryStore = entryStore ?? new EntryStore(conn);
        this.userStore = userStore ?? new UserStore(conn);
        this.apiKeyStore = apiKeyStore ?? new ApiKeyStore(conn);
    }

    async initDataSources() {
        await this.blogStore.init();
        await this.entryStore.init();
        await this.userStore.init();
        await this.apiKeyStore.init();
    }

    async createBlog(handle: string, name: string): Promise<Blog> {
        if (this.user) {
            await this.initDataSources();
            if (await this.blogStore.retrieveByUserId(this.user.id)) {
                throw new GraphQLError('Currently only one blog per user is supported.', {
                    extensions: { code: 'UNSUPPORTED'}
                });
            }
            return await this.blogStore.create(this.user.id, handle, name);
        }
        throw new GraphQLError('Must be logged in to createBlog', {
            extensions: { code: 'FORBIDDEN'}
        });
    }

    async createEntry(blogId: string, title: string, content: string): Promise<Entry> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.blogStore.retrieveById(blogId);
            if (blog?.userId !== this.user.id) {
                throw new GraphQLError('You are not authorized to create entries for this blog.', {
                    extensions: { code: 'FORBIDDEN'}
                });
            }
            return await this.entryStore.create(blogId, title, content);
        }
        throw new GraphQLError('Must be logged in to createEntry', {
            extensions: { code: 'FORBIDDEN'}
        });
    }

    async deleteBlog(id: string): Promise<Node> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.blogStore.retrieveById(id);
            if (blog?.userId !== this.user.id) {
                throw new GraphQLError('You are not authorized to delete this blog.', {
                    extensions: { code: 'FORBIDDEN'}
                });
            }
            await this.blogStore.delete(id);
            return {id};
        }
        throw new GraphQLError('Must be logged in to deleteBlog')
    }

    async deleteEntry(id: string): Promise<Node> {
        if (this.user) {
            await this.initDataSources();
            const entry = await this.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new GraphQLError('You are not authorized to delete entries for this blog.', {
                        extensions: { code: 'FORBIDDEN'}
                    });
                }
                await this.entryStore.delete(id);
                return {id};
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new GraphQLError('Must be logged in to deleteEntry', {
            extensions: { code: 'FORBIDDEN'}
        });
    }

    async getBlog(handle: string): Promise<Blog | null> {
        await this.initDataSources();
        return await this.blogStore.retrieve(handle);
    }

    async getBlogById(id: string): Promise<Blog | null> {
        await this.initDataSources();
        return await this.blogStore.retrieveById(id);
    }

    async getBlogForUser(userId: string): Promise<Blog | null> {
        await this.initDataSources();
        return await this.blogStore.retrieveByUserId(userId);
    }

    async getBlogs(first: number, last: number, before: string, after: string):
        Promise<ResponseConnection<ResponseEdge<Blog>>> {
        await this.initDataSources();
        return resolveCollection<Blog>({first, last, before, after}, async (cursor: Cursor) => {
            return await this.blogStore.retrieveAll(cursor.limit, cursor.offset);
        });
    }

    async getDrafts(blog: Blog, first: number, last: number, before: string, after: string):
        Promise<ResponseConnection<ResponseEdge<Entry>>> {
        await this.initDataSources();
        return resolveCollection<Entry>({first, last, before, after}, async (cursor: Cursor) => {
            return await this.entryStore.retrieveAllDrafts(blog.id, cursor.limit, cursor.offset);
        });
    }

    async getEntries(blog: Blog, first: number, last: number, before: string, after: string):
        Promise<ResponseConnection<ResponseEdge<Entry>>> {
        await this.initDataSources();
        return resolveCollection<Entry>({first, last, before, after}, async (cursor: Cursor) => {
            console.log(`Fetching limit ${cursor.limit} entries after cursor ${cursor.offset}`);
            return await this.entryStore.retrieveAll(blog.id, cursor.limit, cursor.offset);
        });
    }

    async getEntry(blog: Blog, id: string): Promise<Entry | null> {
        await this.initDataSources();
        const entry = await this.entryStore.retrieve(id);

        // Authorization check
        if (entry && !entry.published && blog.userId !== this.user?.id) {
            throw new GraphQLError('You are not authorized to view this entry.', {
                extensions: { code: 'FORBIDDEN' }
            });
        }

        return entry;
    }

    async getUser(blog: Blog, id: string): Promise<User | null> {
        await this.initDataSources();
        return await this.userStore.retrieve(blog.userId);
    }

    async updateBlog(id: string, name: string): Promise<Blog | null> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.blogStore.retrieveById(id);
            if (blog?.userId !== this.user.id) {
                throw new GraphQLError('You are not authorized to update this blog.', {
                    extensions: { code: 'FORBIDDEN'}
                });
            }
            return await this.blogStore.update(id, name);
        }
        throw new GraphQLError('Must be logged in to updateBlog', {
            extensions: { code: 'FORBIDDEN'}
        });
    }

    async updateEntry(id: string, title: string, content: string): Promise<Entry | null> {
        log(DEBUG, `updating entry`);
        if (this.user) {
            await this.initDataSources();
            const entry = await this.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new GraphQLError('You are not authorized to update entries for this blog.', {
                        extensions: { code: 'FORBIDDEN'}
                    });
                }
                return await this.entryStore.update(id, title, content);
            }
            throw new GraphQLError(`Entry ${id} not found`);
        }
        throw new GraphQLError('Must be logged in to updateEntry', {
            extensions: { code: 'FORBIDDEN'}
        });
    }

    async publishEntry(id: string): Promise<Entry | null> {
        if (this.user) {
            await this.initDataSources();
            const entry = await this.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new GraphQLError('You are not authorized to update entries for this blog.');
                }
                return await this.entryStore.publish(id);
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new GraphQLError('Must be logged in to updateEntry', {
            extensions: { code: 'FORBIDDEN'}
        });
    }

    async issueApiKey(): Promise<string | null> {
        if (this.user?.id) {
            return await this.apiKeyStore.issue(this.user?.id);
        }
        throw new GraphQLError('Must be logged in to request API key', {
            extensions: { code: 'FORBIDDEN'}
        });
    }
}