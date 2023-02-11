/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import BlogStore, {Blog} from './blogstore.js';
import {Entry, EntryStore} from './entrystore.js';
import {User, UserStore} from './userstore.js';
import {Node} from './node.js';
import {Response, Cursor, resolveCollection} from './pagination.js';
import {AuthenticationError, ForbiddenError} from 'apollo-server-express';
import {DEBUG, log} from "./utils.js";
import DBConnection from "./dbconnection";
import {ApiKeyStore} from "./apikeystore";


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

    initDataSources(): void;
}

export class BlogServiceSequelizeImpl implements BlogService {

    user: User | undefined;

    blogStore: BlogStore;
    entryStore: EntryStore;
    userStore: UserStore;
    apiKeyStore: ApiKeyStore;

    constructor(user: User | undefined, conn: DBConnection) {
        this.user = user;
        this.blogStore = new BlogStore(conn);
        this.entryStore = new EntryStore(conn);
        this.userStore = new UserStore(conn);
        this.apiKeyStore = new ApiKeyStore(conn);
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
                throw new ForbiddenError('Currently only one blog per user is supported.');
            }
            return await this.blogStore.create(this.user.id, handle, name);
        }
        throw new AuthenticationError('Must be logged in to createBlog');
    }

    async createEntry(blogId: string, title: string, content: string): Promise<Entry> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.blogStore.retrieveById(blogId);
            if (blog?.userId !== this.user.id) {
                throw new AuthenticationError('You are not authorized to create entries for this blog.');
            }
            return await this.entryStore.create(blogId, title, content);
        }
        throw new AuthenticationError('Must be logged in to createEntry');
    }

    async deleteBlog(id: string): Promise<Node> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.blogStore.retrieveById(id);
            if (blog?.userId !== this.user.id) {
                throw new AuthenticationError('You are not authorized to delete this blog.');
            }
            await this.blogStore.delete(id);
            return {id};
        }
        throw new AuthenticationError('Must be logged in to deleteBlog')
    }

    async deleteEntry(id: string): Promise<Node> {
        if (this.user) {
            await this.initDataSources();
            const entry = await this.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new AuthenticationError('You are not authorized to delete entries for this blog.');
                }
                await this.entryStore.delete(id);
                return {id};
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new AuthenticationError('Must be logged in to deleteEntry');
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

    async getBlogs(limit: number, offset: number, cursor: string): Promise<Response<Blog>> {
        await this.initDataSources();
        return resolveCollection<Blog>({limit, cursor}, async (cursor: Cursor) => {
            return await this.blogStore.retrieveAll(cursor.limit + 1, cursor.offset);
        });
    }

    async getDrafts(blog: Blog, limit: number, offset: number, cursor: string): Promise<Response<Entry>> {
        await this.initDataSources();
        return resolveCollection<Entry>({limit, cursor}, async (cursor: Cursor) => {
            return await this.entryStore.retrieveAllDrafts(blog.id, cursor.limit + 1, cursor.offset);
        });
    }

    async getEntries(blog: Blog, limit: number, offset: number, cursor: string): Promise<Response<Entry>> {
        await this.initDataSources();
        return resolveCollection<Entry>({limit, cursor}, async (cursor: Cursor) => {
            return await this.entryStore.retrieveAll(blog.id, cursor.limit + 1, cursor.offset);
        });
    }

    async getEntry(blog: Blog, id: string): Promise<Entry | null> {
        await this.initDataSources();
        return await this.entryStore.retrieve(id);
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
                throw new AuthenticationError('You are not authorized to update this blog.');
            }
            return await this.blogStore.update(id, name);
        }
        throw new AuthenticationError('Must be logged in to updateBlog');
    }

    async updateEntry(id: string, title: string, content: string): Promise<Entry | null> {
        log(DEBUG, `updating entry`);
        if (this.user) {
            await this.initDataSources();
            const entry = await this.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new AuthenticationError('You are not authorized to update entries for this blog.');
                }
                return await this.entryStore.update(id, title, content);
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new AuthenticationError('Must be logged in to updateEntry');
    }

    async publishEntry(id: string): Promise<Entry | null> {
        if (this.user) {
            await this.initDataSources();
            const entry = await this.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new AuthenticationError('You are not authorized to update entries for this blog.');
                }
                return await this.entryStore.publish(id);
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new AuthenticationError('Must be logged in to updateEntry');
    }

    async issueApiKey(): Promise<string | null> {
        if (this.user?.id) {
            return await this.apiKeyStore.issue(this.user?.id);
        }
        throw new AuthenticationError('Must be logged in to request API key');
    }
}