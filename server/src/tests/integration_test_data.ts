/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from '../entries/entry.js';
import {expect} from '@jest/globals';
import {randomString} from "../utils.js";
import {Blog} from '../blogs/blog.js';
import {User} from '../users/user.js';
import BlogStore from "../blogs/blogstore";
import {EntryStore} from "../entries/entrystore";

export const NUM_BLOGS = 100;
export const NUM_ENTRIES = 100;

export async function createBlogAndTestEntriesViaSql(user: User, bs: BlogStore, es: EntryStore): Promise<Blog> {
    const blog: Blog = await bs.create(user.id, 'bloghandle', 'Blog Name');
    const blogId = blog.id;
    for (let i = 0; i < NUM_ENTRIES; i++) {
        const entry: Entry = await es.create(blogId, 'Entry Title ' + i, 'Entry content ' + i);
        es.publish(entry.id);
        expect(entry.id).toBeDefined();
        await sleep(5);
    }
    return blog;
}

export async function createTestBlogsViaSql(users: User[], bs: BlogStore): Promise<Blog[]> {
    const blogs: Blog[] = []
    for (let i = 0; i < users.length; i++) {
        const slug = randomString(5);
        blogs.push(await bs.create(users[i].id, `blog${slug}`, `Blog ${i} ${slug}`));
        await sleep(5);
    }
    return blogs;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


