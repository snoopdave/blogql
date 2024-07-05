/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {gql} from '@apollo/client';

export const ENTRY_QUERY = gql`query EntryQuery($handle: String!, $id: ID!) {
    blog(handle: $handle) {
        id
        name
        handle 
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

export const ENTRIES_QUERY = gql`query EntriesQuery(
        $handle: String!, $first: Int, $last: Int, $before: String, $after: String) {
    blog(handle: $handle) {
        id
        handle
        name
        user {
            id
            email
            username
            picture
        }
        entries(first: $first, last: $last, before: $before, after: $after) {
            edges {
                node {
                    id
                    title
                    content
                    created
                    updated
                    published
                }
                cursor
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
                totalCount
            }
        }
    }
}`;

export const DRAFTS_QUERY = gql`query DraftsQuery($handle: String!, $first: Int, $last: Int, $before: String, $after: String) {
    blog(handle: $handle) {
        id
        name
        drafts(first: $first, last: $last, before: $before, after: $after) {
            edges {
                node {
                    id
                    title
                    content
                    created
                    updated
                    published
                }
                cursor
            }
            pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
                totalCount
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

export const BLOGS_QUERY = gql`query Blogs($first: Int, $last: Int, $before: String, $after: String) {
    blogs(first: $first, last: $last, before: $before, after: $after) {
        edges {
            node {
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
            cursor
        }
        pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
            totalCount
        }
    }
}`

export const BLOG_BY_HANDLE_QUERY = gql`query BlogQuery($handle: String!) {
    blog(handle: $handle) {
        id
        name
    }
}`

