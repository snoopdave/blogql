/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import EntryStore, {Entry} from './entrystore.js';
import {Cursor, resolveCollection, Response} from './pagination.js';
import {Node} from './node.js';
import {AuthenticationError, ForbiddenError} from 'apollo-server-express';
import BlogStore, {Blog} from './blogstore';
import {User} from './userstore';


const resolvers = {
    Node: {
        __resolveType: (node) => {
            const type = node.id.split('-')[5];
            return type[0].toUpperCase() + type.slice(1);
        }
    },
    Query: {
        blogForUser: async (_, args: { userId: string }, {dataSources}): Promise<Blog | null> => {
            let blogStore: BlogStore = dataSources.blogStore;
            await blogStore.init();
            return await blogStore.retrieveByUserId(args.userId);
        },
        blog: async (_, args: { handle: string }, {dataSources}): Promise<Blog | null> => {
            let blogStore: BlogStore = dataSources.blogStore;
            await blogStore.init();
            return await blogStore.retrieve(args.handle);
        },
        blogs: async (_, args: { limit: number, offset: number, cursor: string }, {dataSources}):
            Promise<Response<Blog>> => {
                await dataSources.blogStore.init();
                return resolveCollection<Blog>(args, async (cursor: Cursor) => {
                    return await dataSources.blogStore.retrieveAll(cursor.limit + 1, cursor.offset);
                });
            },
    },
    Blog: {
        entry: async (_, args: { id: string }, {dataSources}): Promise<Entry | null> => {
            return await dataSources.entryStore.retrieve(args.id);
        },
        user: async (blog, args: {}, {dataSources}): Promise<User | null> => {
            return await dataSources.userStore.retrieve(blog.userId);
        },
        entries: async (blog, args: { limit: number, offset: number, cursor: string }, {dataSources}):
            Promise<Response<Entry>> => {
                let entryStore: EntryStore = dataSources.entryStore;
                await entryStore.init();
                return resolveCollection<Entry>(args, async (cursor: Cursor) => {
                    return await entryStore.retrieveAll(blog.id, cursor.limit + 1, cursor.offset);
                });
            },
    },
    Mutation: {
        createEntry: async (_, args: { blogId: string, title: string, content: string }, {
            dataSources,
            user
        }): Promise<Entry> => {
            if (user) {
                await dataSources.blogStore.init();
                const blog = await dataSources.blogStore.retrieveById(args.blogId);
                if (blog.userId !== user.id) {
                    throw new AuthenticationError('You are not authorized to create entries for this blog.');
                }
                await dataSources.entryStore.init();
                return await dataSources.entryStore.create(args.blogId, args.title, args.content);
            }
            throw new AuthenticationError('Must be logged in to createEntry');
        },
        updateEntry: async (_, args: { id: string, title: string, content: string }, {dataSources, user}):
            Promise<Entry | null> => {
            if (user) {
                let entryStore: EntryStore = dataSources.entryStore;
                await entryStore.init();
                const entry = await entryStore.retrieve(args.id);
                await dataSources.blogStore.init();
                const blog = await dataSources.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== user.id) {
                    throw new AuthenticationError('You are not authorized to update entries for this blog.');
                }
                return await entryStore.update(args.id, args.title, args.content);
            }
            throw new AuthenticationError('Must be logged in to updateEntry');
        },
        deleteEntry: async (_, args: { id: string }, {dataSources, user}): Promise<Node> => {
            if (user) {
                let entryStore: EntryStore = dataSources.entryStore;
                await entryStore.init();
                const entry = await entryStore.retrieve(args.id);
                await dataSources.blogStore.init();
                const blog = await dataSources.blogStore.retrieveById(entry?.blogId);
                if (blog?.userId !== user.id) {
                    throw new AuthenticationError('You are not authorized to delete entries for this blog.');
                }
                await entryStore.delete(args.id);
                return {id: args.id};
            }
            throw new AuthenticationError('Must be logged in to deleteEntry');
        },
        createBlog: async (_, args: { handle: string, name: string }, {dataSources, user}): Promise<Blog> => {
            if (user) {
                const blogStore: BlogStore = dataSources.blogStore;
                await blogStore.init();
                if (await blogStore.retrieveByUserId(user.id)) {
                    throw new ForbiddenError('Currently only one blog per user is supported.');
                }
                return await blogStore.create(user.id, args.name, args.handle);
            }
            throw new AuthenticationError('Must be logged in to createBlog');
        },
        updateBlog: async (_, args: { id: string, name: string }, {dataSources, user}): Promise<Blog | null> => {
            if (user) {
                const blogStore: BlogStore = dataSources.blogStore;
                await blogStore.init();
                const blog = await blogStore.retrieveById(args.id);
                if (blog?.userId !== user.id) {
                    throw new AuthenticationError('You are not authorized to update this blog.');
                }
                return await blogStore.update(args.id, args.name);
            }
            throw new AuthenticationError('Must be logged in to createBlog');
        },
        deleteBlog: async (_, args: { id: string }, {dataSources, user}): Promise<Node> => {
            if (user) {
                const blogStore: BlogStore = dataSources.blogStore;
                await blogStore.init();
                const blog = await blogStore.retrieveById(args.id);
                if (blog?.userId !== user.id) {
                    throw new AuthenticationError('You are not authorized to delete this blog.');
                }
                await blogStore.delete(args.id);
                return {id: args.id};
            }
            throw new AuthenticationError('Must be logged in to deleteBlog');
        },
    }
}

export default resolvers;
