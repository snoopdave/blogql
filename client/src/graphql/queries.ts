/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {gql} from '@apollo/client';

export const ENTRY_QUERY = gql`query EntryQuery($handle: String!, $id: ID!) {
    blog(handle: $handle) {
        id
        name
        user {
            username
            picture
        }
        entry(id: $id) {
            id
            title
            content
            created
            updated
            published
        }
    }
}`;

export const ENTRIES_QUERY = gql`query EntriesQuery($handle: String!, $limit: Int, $offset: Int, $cursor: String) {
    blog(handle: $handle) {
        id
        handle
        name
        user {
            email
            username
            picture
        }
        entries(limit: $limit, offset: $offset, cursor: $cursor) {
            nodes {
                id
                title
                content
                created
                updated
                published
            }
            pageInfo {
                totalCount
                cursor
            }
        }
    }
}`;

export const DRAFTS_QUERY = gql`query DraftsQuery($handle: String!, $limit: Int, $offset: Int, $cursor: String) {
    blog(handle: $handle) {
        id
        name
        drafts(limit: $limit, offset: $offset, cursor: $cursor) {
            nodes {
                id
                key: id
                title
                content
                created
                updated
                published
            }
            pageInfo {
                totalCount
                cursor
            }
        }
    }
}`

export const USER_BLOG_QUERY = gql`query UserBlogQuery($userId: ID!) {
    blogForUser(userId: $userId) {
        id
        handle 
    }
}`;

export const BLOGS_QUERY = gql`query Blogs($limit: Int, $offset: Int, $cursor: String) {
    blogs(limit: $limit, offset: $offset, cursor: $cursor) {
        nodes {
            id
            key: id
            handle
            name
            created
            updated
            user {
                id
                username
            }
        }
    }
}`

export const BLOG_BY_HANDLE_QUERY = gql`query BlogQuery($handle: String!) {
    blog(handle: $handle) {
        id
        name
    }
}`

