/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {gql} from '@apollo/client';


export const BLOG_CREATE_MUTATION = gql`mutation BlogCreateMutation($blog: BlogCreateInput!) {
    createBlog(blog: $blog) {
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
}`;

export const BLOG_UPDATE_MUTATION = gql`mutation BlogUpdateMutation($id: ID!, $blog: BlogUpdateInput!) {
    blogByID(id: $id) {
        update(blog: $blog) {
            id
        }
    }
}`;

export const BLOG_DELETE_MUTATION = gql`mutation BlogDeleteMutation($id: ID!) {
    blogByID(id: $id) {
        delete {
            id
        }
    }
}`;

export const ENTRY_CREATE_MUTATION = gql`mutation EntryCreateMutation(
    $handle: String!, $entry: EntryCreateInput!) {
    blog(handle: $handle) {
        createEntry(entry: $entry) {
            id
            title
            content
            created
            updated
            published
        }
    }
}`;

export const ENTRY_UPDATE_MUTATION = gql`mutation EntryUpdateMutation(
    $handle: String!, $id: ID!, $entry: EntryUpdateInput!) {
    blog(handle: $handle) {
        entry(id: $id) {
            update(entry: $entry) {
                id
                title
                content
                created
                updated
                published
            }
        }
    }
}`;

export const ENTRY_PUBLISH_MUTATION = gql`mutation EntryPublishMutation(
    $handle: String!, $id: ID!) {
    blog(handle: $handle) {
        entry(id: $id) {
            publish {
                id
                title
                content
                created
                updated
                published
            }
        }
    }
}`;

export const ENTRY_DELETE_MUTATION = gql`mutation EntryDeleteMutation($handle: String!, $id: ID!) {
    blog(handle: $handle) {
        entry(id: $id) {
            delete {
                id
            }
        }
    }
}`;

export const ISSUE_API_KEY_MUTATION = gql`mutation IssueApiKeyMutation {
    issueApiKey
}`;


