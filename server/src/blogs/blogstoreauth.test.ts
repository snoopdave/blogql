/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { GraphQLError } from 'graphql';
import { BlogServiceSequelizeImpl } from "../blogservice";
import { UserStore } from "../users/userstore";
import BlogStore from "./blogstore";
import { EntryStore } from "../entries/entrystore";
import DBConnection from "../utils/dbconnection";
import { User } from "../users/user";
import { Blog } from "./blog";
import { Entry } from "../entries/entry";
import ApiKeyStore from "../apikeys/apikeystore";
import { FindAllResult } from "../pagination";

describe('BlogService Authentication Tests', () => {
    let authenticatedBlogService: BlogServiceSequelizeImpl;
    let unauthenticatedBlogService: BlogServiceSequelizeImpl;
    let mockUserStore: jest.Mocked<UserStore>;
    let mockBlogStore: jest.Mocked<BlogStore>;
    let mockEntryStore: jest.Mocked<EntryStore>;
    let mockApiStore: jest.Mocked<ApiKeyStore>;
    let mockDBConnection: jest.Mocked<DBConnection>;

    beforeEach(() => {

        jest.mock("./blogstore");

        mockDBConnection = new DBConnection('') as jest.Mocked<DBConnection>;

        mockUserStore = new UserStore({} as any) as jest.Mocked<UserStore>;
        mockUserStore.init = jest.fn();

        mockBlogStore = new BlogStore({} as any) as jest.Mocked<BlogStore>;
        mockBlogStore.init = jest.fn();

        mockEntryStore = new EntryStore({} as any) as jest.Mocked<EntryStore>;
        mockEntryStore.init = jest.fn();

        mockApiStore = new ApiKeyStore({} as any) as jest.Mocked<ApiKeyStore>;
        mockApiStore.init = jest.fn();

        const authenticatedUser = { id: '1', username: 'testuser', email: 'test@example.com' } as User;
        authenticatedBlogService = new BlogServiceSequelizeImpl(authenticatedUser, mockDBConnection,
            mockBlogStore, mockEntryStore, mockUserStore, mockApiStore);
        authenticatedBlogService['userStore'] = mockUserStore;
        authenticatedBlogService['blogStore'] = mockBlogStore;
        authenticatedBlogService['entryStore'] = mockEntryStore;

        unauthenticatedBlogService = new BlogServiceSequelizeImpl(null, mockDBConnection,
            mockBlogStore, mockEntryStore, mockUserStore, mockApiStore);
        unauthenticatedBlogService['userStore'] = mockUserStore;
        unauthenticatedBlogService['blogStore'] = mockBlogStore;
        unauthenticatedBlogService['entryStore'] = mockEntryStore;
    });

    it('should allow access to protected resources for authenticated user', async () => {
        const blog = {
            id: '1',
            userId: '1',
            handle: 'testblog',
            name: 'Test Blog' } as Blog;
        mockBlogStore.retrieveById = jest.fn();
        mockBlogStore.retrieveById.mockReturnValue(Promise.resolve(blog));

        const entry = {
            id: '1',
            blogId: '1',
            title: 'Test Entry',
            content: 'Test Content',
            created: new Date(),
            updated:  new Date(),
            published:  new Date()
        } as Entry;
        mockEntryStore.create= jest.fn();
        mockEntryStore.create.mockReturnValue(Promise.resolve(entry));

        const createdEntry = await authenticatedBlogService.createEntry('1', 'Test Entry', 'Test Content');

        expect(createdEntry).toEqual(entry);
        expect(mockEntryStore.create).toHaveBeenCalledWith('1', 'Test Entry', 'Test Content');
    });

    it('should deny access to protected resources for unauthenticated user', async () => {
        await expect(unauthenticatedBlogService.createEntry('1', 'Test Entry', 'Test Content'))
            .rejects.toThrow(GraphQLError);
    });
    // Public User Tests
    it('should allow public users to get a list of blogs', async () => {
        const blogs = [{ id: '1', handle: 'publicblog', name: 'Public Blog' } as Blog];

        mockBlogStore.retrieveAll = jest.fn();
        mockBlogStore.retrieveAll.mockReturnValue(Promise.resolve(convertToFindAllResult(blogs, 1)));

        const result = await unauthenticatedBlogService.getBlogs(10, 0, "", "");

        // Check the structure and content of the result
        expect(result.edges).toHaveLength(blogs.length);
        result.edges.forEach((edge, index) => {
            expect(edge.node).toEqual(blogs[index]);
            expect(typeof edge.cursor).toBe('string');
        });

        const expectedResult = {
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: expect.any(String),
                endCursor: expect.any(String),
                totalCount: 1
            }
        };
        expect(result.pageInfo).toEqual(expectedResult.pageInfo);
    });

    function convertToFindAllResult<T>(rows: T[] = [], totalCount: number = 0): FindAllResult<T> {
        const count = rows.length;
        return {
            rows,
            count,
            totalCount
        };
    }

    it('should allow public users to view public entries of any blog', async () => {
        // Define a sample entry that represents a public blog entry
        const entries = [
            { id: '1', title: 'Public Entry', content: 'Content', published: new Date() } as Entry
        ];

        // Define a sample blog that the entry belongs to
        const blog = {
            id: '1',
            userId: '1',
            handle: 'testblog',
            name: 'Test Blog'
        } as Blog;

        // Mock the retrieveAll method of the entry store to return the mock response connection
        mockEntryStore.retrieveAll = jest.fn();
        mockEntryStore.retrieveAll.mockReturnValue(Promise.resolve(convertToFindAllResult(entries, 1)));

        // Call the getEntries method of the unauthenticated blog service to retrieve entries for the blog
        const result = await unauthenticatedBlogService.getEntries(blog, 10, 0, "", "");

        // Check the structure and content of the result
        // Ensure the number of edges in the result matches the number of entries
        expect(result.edges).toHaveLength(entries.length);

        // Verify each edge's node matches the corresponding entry and the cursor is a string
        result.edges.forEach((edge, index) => {
            expect(edge.node).toEqual(entries[index]);
            expect(typeof edge.cursor).toBe('string');
        });

        // Define the expected pageInfo object for comparison
        const expectedResult = {
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: expect.any(String),
                endCursor: expect.any(String),
                totalCount: 1
            }
        };

        // Verify the pageInfo in the result matches the expected pageInfo
        expect(result.pageInfo).toEqual(expectedResult.pageInfo);
    });

    it('should not allow public users to create a blog', async () => {
        await expect(unauthenticatedBlogService.createBlog('newblog', 'New Blog')).rejects.toThrow(GraphQLError);
    });

    it('should not allow public users to view draft entries of any blog', async () => {
        const blog = {
            id: '1',
            userId: '1',
            handle: 'testblog',
            name: 'Test Blog'
        } as Blog;

        mockEntryStore.retrieveAllDrafts = jest.fn();
        mockEntryStore.retrieveAllDrafts.mockReturnValue(Promise.resolve(convertToFindAllResult([], 0)));

        const result = await unauthenticatedBlogService.getDrafts(blog, 10, 0, "", "");

        // Check the structure and content of the result
        expect(result.edges).toHaveLength(0);
        result.edges.forEach(edge => {
            expect(typeof edge.cursor).toBe('string');
        });

        const expectedResult = {
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null,
                totalCount: 0
            }
        };
        expect(result.pageInfo).toEqual(expectedResult.pageInfo);
    });

    it('should not allow public users to create blog entries', async () => {
        await expect(unauthenticatedBlogService.createEntry('publicblog', 'New Entry', 'Content')).rejects.toThrow(GraphQLError);
    });

    it('should not allow public users to update blogs', async () => {
        await expect(unauthenticatedBlogService.updateBlog('1', 'Updated Blog')).rejects.toThrow(GraphQLError);
    });

    it('should not allow public users to create API keys', async () => {
        await expect(unauthenticatedBlogService.issueApiKey()).rejects.toThrow(GraphQLError);
    });

    // Logged-In User Tests
    it('should allow logged-in users to create one blog', async () => {

        // initially user has no blogs
        mockBlogStore.retrieveByUserId = jest.fn();
        mockBlogStore.retrieveByUserId.mockReturnValue(Promise.resolve(null));

        const blog = { id: '1', userId: '1', handle: 'newblog', name: 'New Blog' } as Blog;
        mockBlogStore.create = jest.fn();
        mockBlogStore.create.mockReturnValue(Promise.resolve(blog));

        const result = await authenticatedBlogService.createBlog('newblog', 'New Blog');
        expect(result).toEqual(blog);
    });

    it('should allow logged-in users to create an API key', async () => {
        const apiKey = 'test-api-key';
        mockApiStore.issue = jest.fn();
        mockApiStore.issue.mockReturnValue(Promise.resolve(apiKey));

        const result = await authenticatedBlogService.issueApiKey();
        expect(result).toEqual(apiKey);
    });

    it('should allow logged-in users to update blog settings', async () => {
        const blog = { id: '1', userId: '1', handle: 'updatedblog', name: 'Updated Blog' } as Blog;
        mockBlogStore.retrieveById = jest.fn();
        mockBlogStore.retrieveById.mockReturnValue(Promise.resolve(blog));

        mockBlogStore.update = jest.fn();
        mockBlogStore.update.mockReturnValue(Promise.resolve(blog));

        const result = await authenticatedBlogService.updateBlog('1', 'Updated Blog');
        expect(result).toEqual(blog);
    });

    it('should allow logged-in users to create blog entries within their blog', async () => {
        const blog = { id: '1', userId: '1', handle: 'updatedblog', name: 'Updated Blog' } as Blog;
        mockBlogStore.retrieveById = jest.fn();
        mockBlogStore.retrieveById.mockReturnValue(Promise.resolve(blog));

        const entry = { id: '1', blogId: '1', title: 'New Entry', content: 'Content', created: new Date(), updated: new Date() } as Entry;
        mockEntryStore.create = jest.fn();
        mockEntryStore.create.mockReturnValue(Promise.resolve(entry));

        const result = await authenticatedBlogService.createEntry('newblog', 'New Entry', 'Content');
        expect(result).toEqual(entry);
    });

    it('should allow logged-in users to view blog entries within their blog', async () => {
        const blog = { id: '1', userId: '1', handle: 'updatedblog', name: 'Updated Blog' } as Blog;
        mockBlogStore.retrieveById = jest.fn();
        mockBlogStore.retrieveById.mockReturnValue(Promise.resolve(blog));

        const entries = [{ id: '1', blogId: '1', title: 'Entry', content: 'Content', created: new Date(), updated: new Date() } as Entry];
        mockEntryStore.retrieveAll = jest.fn();
        mockEntryStore.retrieveAll.mockReturnValue(Promise.resolve({ rows: entries, count: 1, totalCount: 1 }));

        const result = await authenticatedBlogService.getEntries(blog, 10, 0, "", "");

        // build the expected result, most importantly including the entries we defined above
        const expectedResult = {
            pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: expect.any(String),
                endCursor: expect.any(String),
                totalCount: 1
            },
            edges: entries.map(entry => {
                return {
                    node: entry,
                    cursor: expect.any(String)
                }
            })
        };
        expect(result).toEqual(expectedResult);
    });

    it('should allow logged-in users to update blog entries within their blog', async () => {
        const blog = { id: '1', userId: '1', handle: 'updatedblog', name: 'Updated Blog' } as Blog;
        mockBlogStore.retrieveById = jest.fn();
        mockBlogStore.retrieveById.mockReturnValue(Promise.resolve(blog));

        const entry = { id: '1', blogId: '1', title: 'Updated Entry', content: 'Updated Content', created: new Date(), updated: new Date() } as Entry;
        mockEntryStore.retrieve = jest.fn();
        mockEntryStore.retrieve.mockReturnValue(Promise.resolve(entry));

        mockEntryStore.update = jest.fn();
        mockEntryStore.update.mockReturnValue(Promise.resolve(entry));

        const result = await authenticatedBlogService.updateEntry('1', 'Updated Entry', 'Updated Content');
        expect(result).toEqual(entry);
    });

    it('should allow logged-in users to delete blog entries within their blog', async () => {
        const blog = { id: '1', userId: '1', handle: 'updatedblog', name: 'Updated Blog' } as Blog;
        mockBlogStore.retrieveById = jest.fn();
        mockBlogStore.retrieveById.mockReturnValue(Promise.resolve(blog));

        const entry = { id: '1', blogId: '1', title: 'Updated Entry', content: 'Updated Content', created: new Date(), updated: new Date() } as Entry;
        mockEntryStore.retrieve = jest.fn();
        mockEntryStore.retrieve.mockReturnValue(Promise.resolve(entry));

        mockEntryStore.update = jest.fn();
        mockEntryStore.update.mockReturnValue(Promise.resolve(entry));

        mockEntryStore.delete = jest.fn();
        mockEntryStore.delete.mockReturnValue(Promise.resolve());

        const result = await authenticatedBlogService.deleteEntry('1');
        expect(result).toEqual({id: '1'});
    });

    it('should allow logged-in users to edit settings within their blog', async () => {
        const blog = { id: '1', userId: '1', handle: 'updatedblog', name: 'Updated Blog' } as Blog;
        mockBlogStore.retrieveById = jest.fn();
        mockBlogStore.retrieveById.mockReturnValue(Promise.resolve(blog));

        mockBlogStore.update = jest.fn();
        mockBlogStore.update.mockReturnValue(Promise.resolve(blog));

        const result = await authenticatedBlogService.updateBlog('1', 'Updated Blog');
        expect(result).toEqual(blog);
    });

    it('should allow logged-in users to get an API key within their blog', async () => {
        const apiKey = 'test-api-key';
        mockApiStore.issue = jest.fn();
        mockApiStore.issue.mockReturnValue(Promise.resolve(apiKey));

        const result = await authenticatedBlogService.issueApiKey();
        expect(result).toEqual(apiKey);
    });
});
