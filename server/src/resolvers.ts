/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from './entrystore.js';
import {Response} from './pagination.js';
import {Node} from './node.js';
import {Blog} from './blogstore.js';
import {User} from './userstore.js';
import {BlogServiceSQLiteImpl} from './blogservice.js';
import {BlogQLContext, BlogQLDataSources} from './index.js';


const resolvers = {
    Node: {
        __resolveType: (node: Node) => {
            const type = node.id.split('-')[5];
            return type[0].toUpperCase() + type.slice(1);
        }
    },
    Query: {
        blogForUser: async (_: undefined, args: { userId: string }, ctx: BlogQLContext): Promise<Blog | null> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.getBlogForUser(args.userId);
        },
        blog: async (_: undefined, args: { handle: string }, ctx: BlogQLContext): Promise<Blog | null> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.getBlog(args.handle);
        },
        blogs: async (_: undefined, args: { limit: number, offset: number, cursor: string }, ctx: BlogQLContext):
            Promise<Response<Blog>> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
                return await blogService.getBlogs(args.limit, args.offset, args.cursor);
        },
    },
    Blog: {
        entry: async (blog: Blog, args: { id: string }, ctx: BlogQLContext): Promise<Entry | null> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.getEntry(blog, args.id);
        },
        user: async (blog: Blog, args: { id: string}, ctx: BlogQLContext): Promise<User | null> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.getUser(blog, args.id)
        },
        entries: async (blog: Blog, args: { limit: number, offset: number, cursor: string }, ctx: BlogQLContext):
            Promise<Response<Entry>> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
                return await blogService.getEntries(blog, args.limit, args.offset, args.cursor);
            },
    },
    Mutation: {
        createEntry: async (_: undefined, args: { blogId: string, title: string, content: string }, ctx: BlogQLContext): Promise<Entry> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.createEntry(args.blogId, args.title, args.content);
        },
        updateEntry: async (_: undefined, args: { id: string, title: string, content: string }, ctx: BlogQLContext):
            Promise<Entry | null> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.updateEntry(args.id, args.title, args.content);
        },
        deleteEntry: async (_: undefined, args: { id: string }, ctx: BlogQLContext): Promise<Node> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.deleteEntry(args.id);
        },
        createBlog: async (_: undefined, args: { handle: string, name: string }, ctx: BlogQLContext): Promise<Blog> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.createBlog(args.name, args.handle);
        },
        updateBlog: async (_: undefined, args: { id: string, name: string }, ctx: BlogQLContext): Promise<Blog | null> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.updateBlog(args.id, args.name);
        },
        deleteBlog: async (_: undefined, args: { id: string }, ctx: BlogQLContext): Promise<Node> => {
            const blogService = new BlogServiceSQLiteImpl(ctx.user, ctx.dataSources);
            return await blogService.deleteBlog(args.id);
        },
    }
}

export default resolvers;
