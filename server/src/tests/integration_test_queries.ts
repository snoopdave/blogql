/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import {ApolloServer, GraphQLResponse} from "@apollo/server";
import {BlogQLContext} from "../index";

export const GET_ENTRIES_QUERY = `
        query getBlogEntries($handle: String!, $first: Int, $last: Int, $before: String, $after: String ) {
            blog(handle: $handle) {
                entries(first: $first, last: $last, before: $before, after: $after) { 
                    edges {
                        node {
                            id
                            title
                            content
                            created
                            updated
                        }
                        cursor
                    }
                    pageInfo {
                        hasPreviousPage
                        hasNextPage
                        startCursor
                        endCursor
                        totalCount
                    } 
                }
            }
        }`;

export async function getEntry(server: ApolloServer<BlogQLContext>, handle: string, entryId: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: GET_ENTRY_QUERY, variables: {handle, id: entryId}}, { contextValue: blogQLContext });
}

const GET_ENTRY_QUERY = `query getEntry($handle: String!, $id: ID!) {
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

export async function createEntry(server: ApolloServer<BlogQLContext>, handle: string, title: string, content: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: CREATE_ENTRY_MUTATION, variables: {handle, entry: { title, content }}}, { contextValue: blogQLContext });
}

const CREATE_ENTRY_MUTATION = `mutation CreateEntry($handle: String!, $entry: EntryCreateInput!) { 
        blog(handle: $handle) {
            createEntry(entry: $entry) {
                id
                title 
                content
                created
                updated
            }
        } 
    }`;

export async function deleteEntry(server: ApolloServer<BlogQLContext>, handle: string, id: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: DELETE_ENTRY_MUTATION , variables: {handle, id}}, { contextValue: blogQLContext });
}

const DELETE_ENTRY_MUTATION  = `mutation DeleteEntry($handle: String!, $id: ID!) {
        blog(handle: $handle) {
            entry(id: $id) {
                delete {
                    id
                }
            } 
        }
    }`;

export async function updateEntry(server: ApolloServer<BlogQLContext>, handle: string, id: string, title: string, content: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query:  UPDATE_ENTRY_MUTATION, variables: {handle, id, entry: { title, content }}}, { contextValue: blogQLContext });
}

const UPDATE_ENTRY_MUTATION = `mutation UpdateEntry($handle: String!, $id: ID!, $entry: EntryUpdateInput!) { 
        blog(handle: $handle) {
            entry(id: $id) {
                update(entry: $entry) {
                    id
                }
            }
        } 
    }`;

export async function createBlog(server: ApolloServer<BlogQLContext>, handle: string, name: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: CREATE_BLOG_MUTATION, variables: {blog: {handle, name}}}, { contextValue: blogQLContext });
}

const CREATE_BLOG_MUTATION = `mutation CreateBlog($blog: BlogCreateInput) { 
        createBlog(blog: $blog) {
            id
            handle
            name 
            created
            updated
            userId
            user {
                id
            }
        } 
    }`;

export async function getBlog(server: ApolloServer<BlogQLContext>, handle: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: GET_BLOG_QUERY, variables: {handle}}, { contextValue: blogQLContext });
}

const GET_BLOG_QUERY = `query getBlog($handle: String!) {
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

export async function updateBlog(server: ApolloServer<BlogQLContext>, handle: string, name: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: UPDATE_BLOG_MUTATION, variables: { handle, blog: { name }}}, { contextValue: blogQLContext });
}

const UPDATE_BLOG_MUTATION = `mutation UpdateBlog($handle: String!, $blog: BlogUpdateInput!) { 
        blog(handle: $handle) {
            update(blog: $blog) {
                id
                name
            }
        } 
    }`;

export async function deleteBlog(server: ApolloServer<BlogQLContext>, handle: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: DELETE_BLOG_MUTATION , variables: {handle}}, { contextValue: blogQLContext });
}

const DELETE_BLOG_MUTATION = `mutation DeleteBlog($handle: String!) { 
        blog(handle: $handle) {
            delete {
                id
            } 
        }
    }`;

export async function getBlogs(server: ApolloServer<BlogQLContext>, limit: number, cursor: string | undefined, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: GET_BLOGS_QUERY, variables: {
            first: limit,
            after: cursor
        }}
        , { contextValue: blogQLContext });
}

export const GET_BLOGS_QUERY= `query getBlogs($first: Int, $last: Int, $before: String, $after: String) {
        blogs(first: $first, last: $last, before: $before, after: $after) { 
            edges {
                node { 
                    id
                    handle 
                    name 
                    created
                    updated
                }
                cursor
            }
            pageInfo {
                hasPreviousPage
                hasNextPage
                startCursor
                endCursor
                totalCount
            } 
        }
    }`;

export async function getBlogForUser(server: ApolloServer<BlogQLContext>, userId: string, blogQLContext: BlogQLContext): Promise<GraphQLResponse> {
    return server.executeOperation({query: GET_BLOGS_FOR_USER_QUERY, variables: {userId}}, { contextValue: blogQLContext });
}

const GET_BLOGS_FOR_USER_QUERY = `query getBlogForUser($userId: ID!) {
        blogForUser(userId: $userId) { 
           id
           handle 
           name 
           created
           updated
        }
    }`;


