/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import { gql } from "@apollo/client";
export const ENTRY_QUERY = gql `query EntryQuery($handle: String!, $id: ID!) {
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
export const ENTRIES_QUERY = gql `query EntriesQuery($blogHandle: String!, $limit: Int, $cursor: String) {
    blog(handle: $blogHandle) {
        entries(limit: $limit, cursor: $cursor) {
            nodes {
                id
                title
                content
                created
                updated
            }
            pageInfo {
                totalCount
                cursor
            }
        }
    }
}`;
export const USER_BLOG_QUERY = gql `query UserBlogQuery($userId: ID!) {
    blogForUser(userId: $userId) {
        id
        handle 
    }
}`;
export const BLOGS_QUERY = gql `query Blogs($cursor: String, $limit: Int) {
    blogs(cursor: $cursor, limit: $limit) {
        nodes {
            id
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
}`;
