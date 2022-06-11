/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {gql} from "apollo-server";

export const typeDefs = gql`
    scalar DateTime

    interface Node {
        id: ID!
    }

    type Entry implements Node {
        id: ID!
        title: String!
        content: String!
        created: DateTime!
        updated: DateTime!
    }

    type EntryResponse {
        nodes: [Entry]!
        pageInfo: PageInfo!
    }

    type User implements Node {
        id: ID!
        username: String!
        email: String!
        picture: String
        created: DateTime!
        updated: DateTime!
    }

    type UserResponse {
        nodes: [User]!
        pageInfo: PageInfo!
    }

    type PageInfo {
        cursor: String
        totalCount: Int!
    }

    type Blog implements Node {
        id: ID!
        name: String!
        handle: String!
        created: DateTime!
        updated: DateTime!
        entry(id: ID!): Entry
        entries(limit: Int, cursor: String): EntryResponse
        userId: ID!
        user: User!
    }

    type BlogResponse {
        nodes: [Blog]!
        pageInfo: PageInfo!
    }

    type Query {
        # node(id: ID!): Node
        blogForUser(userId: ID!): Blog
        blog(handle: String!): Blog
        blogs(limit: Int, cursor: String): BlogResponse
    }

    type Mutation {
        createBlog(handle: String!, name: String!): Blog
        updateBlog(id: ID!, name: String!): Blog
        deleteBlog(id: ID!): Node
        
        createEntry(blogId: ID!, title: String!, content: String!): Entry
        updateEntry(id: ID!, title: String!, content: String!): Entry
        deleteEntry(id: ID!): Node
    }
`;