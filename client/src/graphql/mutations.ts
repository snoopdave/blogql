/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {gql} from '@apollo/client';


export const BLOG_CREATE_MUTATION = gql`mutation BlogCreateMutation($handle: String!, $name: String!) {
    createBlog(handle: $handle, name: $name) {
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

export const BLOG_UPDATE_MUTATION = gql`mutation BlogUpdateMutation($id: ID!, $name: String!) {
    blogByID(id: $id) {
        update(name: $name) {
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
    $handle: String!, $title: String!, $content: String!) {
    blog(handle: $handle) {
        createEntry(title: $title, content: $content) {
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
    $handle: String!, $id: ID!, $title: String!, $content: String!) {
    blog(handle: $handle) {
        entry(id: $id) {
            update(title: $title, content: $content) {
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


