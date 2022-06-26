/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {gql} from '@apollo/client';


export const BLOG_CREATE_MUTATION = gql`mutation BlogCreateMutation($handle: String!, $name: String!) {
    createBlog(handle: $handle, name: $name) {
        id
        name
        handle
        created
    }
}`;

export const BLOG_UPDATE_MUTATION = gql`mutation BlogUpdateMutation($id: ID!, $name: String!) {
    updateBlog(id: $id, name: $name) {
        id 
    }
}`;

export const BLOG_DELETE_MUTATION = gql`mutation BlogDeleteMutation($id: ID!) {
    deleteBlog(id: $id) {
        id
    }
}`;

export const ENTRY_CREATE_MUTATION = gql`mutation EntryCreateMutation($blogId: ID!, $title: String!, $content: String!) {
    createEntry(blogId: $blogId, title: $title, content: $content) {
        id
        title
        content
        created
        updated
    }
}`;

export const ENTRY_UPDATE_MUTATION = gql`mutation EntryUpdateMutation($id: ID!, $title: String!, $content: String!) {
    updateEntry(id: $id, title: $title, content: $content) {
        id
        title
        content
        created
        updated
    }
}`;

export const ENTRY_DELETE_MUTATION = gql`mutation EntryDeleteMutation($id: ID!) {
    deleteEntry(id: $id) {
        id
    }
}`;

export const ENTRY_PUBLISH_MUTATION = gql`mutation EntryPublishMutation($id: ID!, $published: Boolean!) {
    publishEntry(id: $id, published: $published) {
        id
    }
}`;

