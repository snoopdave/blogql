/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import BlogStore, {Blog} from './blogstore.js';
import EntryStore, {Entry} from './entrystore.js';
import {User} from './userstore.js';
import {Node} from './node.js';
import {Response, Cursor, resolveCollection} from './pagination.js';
import {AuthenticationError, ForbiddenError} from 'apollo-server-express';
import {BlogQLDataSources} from "./index";


export interface BlogService {

    // query

    getBlogForUser(userId: string): Promise<Blog | null>;
    getBlog(handle: string): Promise<Blog | null>;
    getBlogs(limit: number, offset: number, cursor: string): Promise<Response<Blog>>;

    // blog

    getEntry(blog: Blog, id: string): Promise<Entry | null>;
    getUser(blog: Blog, id: string): Promise<User | null>;
    getEntries(blog: Blog, limit: number, offset: number, cursor: string): Promise<Response<Entry>>;

    // mutation

    createEntry(blogId: string, title: string, content: string, published: boolean | undefined): Promise<Entry>;
    updateEntry(id: string, title: string, content: string, published: boolean | undefined): Promise<Entry | null>;
    deleteEntry(id: string): Promise<Node>;

    createBlog(name: string, handle: string): Promise<Blog>;
    updateBlog(id: string, name: string): Promise<Blog | null>;
    deleteBlog(id: string): Promise<Node>;
}

export class BlogServiceSQLiteImpl implements BlogService {
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
            return await this.dataSources.blogStore.create(this.user.id, name, handle);
        }
        throw new AuthenticationError('Must be logged in to createBlog');
    }

    async createEntry(blogId: string, title: string, content: string, published: boolean | undefined): Promise<Entry> {
        if (this.user) {
            await this.initDataSources();
            const blog = await this.dataSources.blogStore.retrieveById(blogId);
            if (blog?.userId !== this.user.id) {
                throw new AuthenticationError('You are not authorized to create entries for this blog.');
            }
            return await this.dataSources.entryStore.create(blogId, title, content, published);
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
        throw new AuthenticationError('Must be logged in to createBlog');
    }

    async updateEntry(id: string, title: string, content: string, publish: boolean | undefined): Promise<Entry | null> {
        if (this.user) {
            await this.initDataSources();
            const entry = await this.dataSources.entryStore.retrieve(id);
            if (entry) {
                const blog = await this.dataSources.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== this.user.id) {
                    throw new AuthenticationError('You are not authorized to update entries for this blog.');
                }
                return await this.dataSources.entryStore.update(id, title, content, publish);
            }
            throw Error(`Entry ${id} not found`);
        }
        throw new AuthenticationError('Must be logged in to updateEntry');
    }
}