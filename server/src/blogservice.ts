/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Blog} from './blogstore.js';
import {Entry} from './entrystore.js';
import {User} from './userstore.js';
import {Node} from './node.js';
import {Response, Cursor, resolveCollection} from './pagination.js';
import {AuthenticationError, ForbiddenError} from 'apollo-server-express';
import {BlogQLDataSources} from "./index.js";
import {log, LogLevel} from "./utils.js";


export interface BlogService {

    // query

    getBlogForUser(userId: string): Promise<Blog | null>;
    getBlog(handle: string): Promise<Blog | null>;
    getBlogById(id: string): Promise<Blog | null>;
    getBlogs(limit: number, offset: number, cursor: string): Promise<Response<Blog>>;

    // blog

    getEntry(blog: Blog, id: string): Promise<Entry | null>;
    getUser(blog: Blog, id: string): Promise<User | null>;
    getEntries(blog: Blog, limit: number, offset: number, cursor: string): Promise<Response<Entry>>;
    getDrafts(blog: Blog, limit: number, offset: number, cursor: string): Promise<Response<Entry>>;

    // mutation

    createEntry(blogId: string, title: string, content: string): Promise<Entry>;
    publishEntry(id: string): Promise<Entry | null>;
    updateEntry(id: string, title: string, content: string): Promise<Entry | null>;
    deleteEntry(id: string): Promise<Node>;

    createBlog(handle: string, name: string): Promise<Blog>;
    updateBlog(id: string, name: string): Promise<Blog | null>;
    deleteBlog(id: string): Promise<Node>;
    issueApiKey(): Promise<string | null>;
}

export class BlogServiceSequelizeImpl implements BlogService {
    dataSources: BlogQLDataSources;
    user: User | undefined;

    constructor(user: User | undefined, ctx: BlogQLDataSources) {
        this.dataSources = ctx;
        this.user = user;
    }

    async initDataSources() {
        await this.dataSources.blogStore.init();
        await this.dataSources.entryStore.init();
        await this.dataSources.userStore.init();
    }

    async createBlog(handle: string, name: string): Promise<Blog> {
        if (this.user) {
            await this.initDataSources();
            if (await this.dataSources.blogStore.retrieveByUserId(this.user.id)) {
                throw new ForbiddenError('Currently only one blog per user is supported.');
            }
            return await this.dataSources.blogStore.create(this.user.id, handle, name);
        }
        throw new AuthenticationError('Must be logged in to createBlog');
    }

    async createEntry(blogId: string, title: string, content: string): Promise<Entry> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.dataSources.blogStore.retrieveById(blogId);
            if (blog?.userId !== this.user.id) {
                throw new AuthenticationError('You are not authorized to create entries for this blog.');
            }
            return await this.dataSources.entryStore.create(blogId, title, content);
        }
        throw new AuthenticationError('Must be logged in to createEntry');
    }

    async deleteBlog(id: string): Promise<Node> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.dataSources.blogStore.retrieveById(id);
            if (blog?.userId !== this.user.id) {
                throw new AuthenticationError('You are not authorized to delete this blog.');
            }
            await this.dataSources.blogStore.delete(id);
            return {id};
        }
        throw new AuthenticationError('Must be logged in to deleteBlog')
    }

    async deleteEntry(id: string): Promise<Node> {
        if (this.user) {
            await this.initDataSources();
            const entry = await this.dataSources.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.dataSources.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new AuthenticationError('You are not authorized to delete entries for this blog.');
                }
                await this.dataSources.entryStore.delete(id);
                return {id};
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new AuthenticationError('Must be logged in to deleteEntry');
    }

    async getBlog(handle: string): Promise<Blog | null> {
        await this.initDataSources();
        return await this.dataSources.blogStore.retrieve(handle);
    }

    async getBlogById(id: string): Promise<Blog | null> {
        await this.initDataSources();
        return await this.dataSources.blogStore.retrieveById(id);
    }

    async getBlogForUser(userId: string): Promise<Blog | null> {
        await this.initDataSources();
        return await this.dataSources.blogStore.retrieveByUserId(userId);
    }

    async getBlogs(limit: number, offset: number, cursor: string): Promise<Response<Blog>> {
        await this.initDataSources();
        return resolveCollection<Blog>({limit, cursor}, async (cursor: Cursor) => {
            return await this.dataSources.blogStore.retrieveAll(cursor.limit + 1, cursor.offset);
        });
    }

    async getDrafts(blog: Blog, limit: number, offset: number, cursor: string): Promise<Response<Entry>> {
        await this.initDataSources();
        return resolveCollection<Entry>({limit, cursor}, async (cursor: Cursor) => {
            return await this.dataSources.entryStore.retrieveAllDrafts(blog.id, cursor.limit + 1, cursor.offset);
        });
    }

    async getEntries(blog: Blog, limit: number, offset: number, cursor: string): Promise<Response<Entry>> {
        await this.initDataSources();
        return resolveCollection<Entry>({limit, cursor}, async (cursor: Cursor) => {
            return await this.dataSources.entryStore.retrieveAll(blog.id, cursor.limit + 1, cursor.offset);
        });
    }

    async getEntry(blog: Blog, id: string): Promise<Entry | null> {
        await this.initDataSources();
        return await this.dataSources.entryStore.retrieve(id);
    }

    async getUser(blog: Blog, id: string): Promise<User | null> {
        await this.initDataSources();
        return await this.dataSources.userStore.retrieve(blog.userId);
    }

    async updateBlog(id: string, name: string): Promise<Blog | null> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.dataSources.blogStore.retrieveById(id);
            if (blog?.userId !== this.user.id) {
                throw new AuthenticationError('You are not authorized to update this blog.');
            }
            return await this.dataSources.blogStore.update(id, name);
        }
        throw new AuthenticationError('Must be logged in to updateBlog');
    }

    async updateEntry(id: string, title: string, content: string): Promise<Entry | null> {
        log(LogLevel.DEBUG, `updating entry`);
        if (this.user) {
            await this.initDataSources();
            const entry = await this.dataSources.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.dataSources.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new AuthenticationError('You are not authorized to update entries for this blog.');
                }
                return await this.dataSources.entryStore.update(id, title, content);
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new AuthenticationError('Must be logged in to updateEntry');
    }

    async publishEntry(id: string): Promise<Entry | null> {
        if (this.user) {
            await this.initDataSources();
            const entry = await this.dataSources.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.dataSources.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new AuthenticationError('You are not authorized to update entries for this blog.');
                }
                return await this.dataSources.entryStore.publish(id);
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new AuthenticationError('Must be logged in to updateEntry');
    }

    async issueApiKey(): Promise<string | null> {
        if (this.user?.id) {
            return await this.dataSources.apiKeyStore.issue(this.user?.id);
        }
        throw new AuthenticationError('Must be logged in to request API key');
    }
}