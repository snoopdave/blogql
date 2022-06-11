/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {gql} from "@apollo/client";

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

