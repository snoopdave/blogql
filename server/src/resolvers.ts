/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from './entries/entry.js';
import {ResponseConnection, ResponseEdge} from './pagination.js';
import {Node} from './node.js';
import {Blog} from './blogs/blog.js';
import {User} from './users/user.js';
import {BlogQLContext} from './index.js';
import {EntryCreateInput, EntryUpdateInput} from "./entries/entrytypes";
import {GraphQLError} from "graphql/error";

const resolvers = {
    Node: {
        __resolveType: (node: Node) => {
            const type = node.id.split('-')[5];
            return type[0].toUpperCase() + type.slice(1);
        }
    },
    Query: {
        blogForUser: async (_: undefined, args: { userId: string }, ctx: BlogQLContext): Promise<Blog | null> => {
            const blog = await ctx.blogService!.getBlogForUser(args.userId);
            console.log(`The blog for user ${args.userId} is ${blog?.id ?? 'null'}.`)
            return blog;
        },
        blog: async (_: undefined, args: { handle: string }, ctx: BlogQLContext): Promise<Blog | null> => {
            return await ctx.blogService!.getBlog(args.handle);
        },
        blogs: async (_: undefined, args: {
            first: number,
            last: number,
            before: string,
            after: string
        }, ctx: BlogQLContext):
            Promise<ResponseConnection<ResponseEdge<Blog>>> => {
                return await ctx.blogService!.getBlogs(args.first, args.after);
        },
    },
    Blog: {
        entry: async (blog: Blog, args: { id: string }, ctx: BlogQLContext): Promise<Entry | null> => {
            return await ctx.blogService!.getEntry(blog, args.id);
        },
        user: async (blog: Blog, args: { id: string}, ctx: BlogQLContext): Promise<User | null> => {
            return await ctx.blogService!.getUser(blog, args.id)
        },
        entries: async (blog: Blog, args: {
            first: number,
            last: number,
            before: string,
            after: string,
        }, ctx: BlogQLContext):
            Promise<ResponseConnection<ResponseEdge<Entry>>> => {
                return await ctx.blogService!.getEntries(blog, args.first, args.after);
        },
        drafts: async (blog: Blog, args: {
            first: number,
            last: number,
            before: string,
            after: string,
        }, ctx: BlogQLContext):
            Promise<ResponseConnection<ResponseEdge<Entry>>> => {
                return await ctx.blogService!.getDrafts(blog, args.first, args.after);
        },
    },
    BlogMutation: {
        update: async (parent: BlogMutation, args: { blog: { name: string }}, ctx: BlogQLContext): Promise<Blog | null> => {
            return await ctx.blogService!.updateBlog(parent.blog.id, args.blog.name);
        },
        delete: async (parent: BlogMutation, args: {}, ctx: BlogQLContext): Promise<Node> => {
            return await ctx.blogService!.deleteBlog(parent.blog.id);
        },
        entry: async (parent: BlogMutation, args: { id: string }, ctx: BlogQLContext): Promise<EntryMutation | null> => {
            const entry: Entry | null = await ctx.blogService!.getEntry(parent.blog, args.id);
            if (entry) {
                return { blog: parent.blog, entry };
            }
            throw Error(`Entry ${args.id} not found`);
        },
        createEntry: async (parent: BlogMutation, args: { entry: EntryCreateInput }, ctx: BlogQLContext): Promise<Entry> => {
            return await ctx.blogService!.createEntry(parent.blog.id, args.entry.title, args.entry.content);
        },
    },
    EntryMutation: {
        update: async (parent: EntryMutation, args: { entry: EntryUpdateInput }, ctx: BlogQLContext):
            Promise<Entry | null> => {
            return await ctx.blogService!.updateEntry(parent.entry.id, args.entry.title, args.entry.content);
        },
        publish: async (parent: EntryMutation, args: { entry: Entry }, ctx: BlogQLContext):
            Promise<Entry | null> => {
            return await ctx.blogService!.publishEntry(parent.entry.id);
        },
        delete: async (parent: EntryMutation, args: {}, ctx: BlogQLContext): Promise<Node> => {
            return await ctx.blogService!.deleteEntry(parent.entry.id);
        },
    },
    Mutation: {
        createBlog: async (_: undefined, args: { blog: { handle: string, name: string }}, ctx: BlogQLContext): Promise<Blog> => {
            const blog = await ctx.blogService!.createBlog(args.blog.handle, args.blog.name);
            console.log(`Created blog ${blog.id} for user ${blog.userId}.`)
            return blog;
        },
        blog: async (_: undefined, args: { handle: string }, ctx: BlogQLContext): Promise<BlogMutation | null> => {
            const blog: Blog | null = await ctx.blogService!.getBlog(args.handle);
            if (blog) {
                return  { blog };
            } else {
                throw Error(`Blog ${args.handle} not found`);
            }
        },
        blogByID: async (_: undefined, args: { id: string }, ctx: BlogQLContext): Promise<BlogMutation | null> => {
            const blog: Blog | null = await ctx.blogService!.getBlogById(args.id);
            if (blog) {
                return  { blog };
            } else {
                throw Error(`Blog ${args.id} not found`);
            }
        },
        issueApiKey: async (_: undefined, args: {}, ctx: BlogQLContext): Promise<string | null> => {
            const apiKey: string | null = await ctx.blogService!.issueApiKey();
            if (apiKey) {
                return apiKey;
            } else {
                throw Error(`Error issuing API key`);
            }
        },
    }
}

interface BlogMutation {
    blog: Blog;
}

interface EntryMutation {
    blog: Blog;
    entry: Entry;
}

export default resolvers;
