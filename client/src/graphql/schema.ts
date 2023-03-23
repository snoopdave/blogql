/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

export interface User {
    id: string;
    email: string;
    created: string;
    updated?: string;
}

export interface Entry {
    id: string;
    key?: string;
    title: string;
    content: string;
    created: Date;
    updated: Date;
    published: Date;
}

export interface Blog {
    id: string;
    key?: string;
    name: string;
    handle: string;
}