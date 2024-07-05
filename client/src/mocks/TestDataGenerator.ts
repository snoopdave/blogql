/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import {Blog, BlogConnection, BlogEdge, Entry, EntryConnection, Maybe, PageInfo, User} from "../gql/graphql";
import template from 'lodash/template.js';
import {Export} from "./ExportType";

const userTemplate = `{
  id: "<%= id %>",
  key: "<%= id %>",
  created: "<%= created %>",
  email: "<%= email %>",
  picture: "<%= picture %>",
  updated: "<%= updated %>",
  username: "<%= username %>"
}`;

const entryTemplate = `{
  node: {
    id: "<%= node.id %>",
    key: "<%= node.id %>",
    content: <%= node.content %>,
    created: "<%= node.created %>",
    published: "<%= node.published %>",
    title: <%= node.title %>,
    updated: "<%= node.updated %>"
  },
  cursor: "<%= cursor %>"
}`;

const blogTemplate = `{
  node: {
    id: "<%= id %>",
    key: "<%= id %>",
    created: "<%= created %>",
    entries: {
      edges: [<%= entries %>],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: "",
        startCursor: ""
      }
    },
    handle: "<%= handle %>",
    name: <%= name %>,
    updated: "<%= updated %>",
    user: <%= user %>,
    userId: "<%= userId %>"
  },
  cursor: "<%= cursor %>"
}`;

const exportTemplate = `
/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Export} from "./ExportType";

export const fixture: Export = {
  blogs: {
    edges: [<%= blogs %>],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      endCursor: "",
      startCursor: ""
    }
  }
};
`;

export interface TestEntry extends Entry {
    key: string;
}

export interface TestEntryEdge {
    cursor: string;
    node: TestEntry;
}

export interface TestEntryConnection {
    edges: Array<TestEntryEdge>;
    pageInfo: PageInfo;
}

export interface TestBlog extends Blog {
    key: string;
    entries: TestEntryConnection;
    user: TestUser;
}

export interface TestBlogEdge {
    cursor: string;
    node: TestBlog;
}

export interface TestBlogConnection {
    edges: Array<TestBlogEdge>;
    pageInfo: PageInfo;
}

export interface TestUser extends User {
    key: string;
}

export interface TestUserEdge {
    cursor: string;
    node: TestUser;
}

export interface TestUserConnection {
    edges: Array<TestUserEdge>;
    pageInfo: PageInfo;
};

// Generate Data
const generateData = (): Export => {
    const blogs: TestBlog[] = [];

    for (let i = 1; i <= 10; i++) {
        const userId = uuidv4();
        const user: TestUser = {
            id: userId,
            key: userId,
            created: faker.date.past().toISOString(),
            email: faker.internet.email(),
            picture: faker.internet.avatar(),
            updated: faker.date.recent().toISOString(),
            username: faker.internet.userName(),
        };

        const entries: TestEntry[] = [];
        for (let j = 1; j <= 40; j++) {
            const id = uuidv4();
            const entry: TestEntry = {
                id,
                key: id,
                content: JSON.stringify(faker.lorem.paragraphs()),
                created: faker.date.past().toISOString(),
                published: faker.date.recent().toISOString(),
                title: JSON.stringify(`Entry ${j}`),
                updated: faker.date.recent().toISOString(),
            };
            entries.push(entry);
        }

        const entryConnection: TestEntryConnection = {
            edges: entries.map((entry) => ({
                node: entry,
                cursor: Buffer.from(entry.id).toString('base64'),
            })),
            pageInfo: {
                startCursor: "",
                endCursor: "",
                hasNextPage: false,
                hasPreviousPage: false,
                totalCount: 100
            },
        };

        const id = uuidv4();
        const blog: TestBlog = {
            id,
            key: id,
            created: faker.date.past().toISOString(),
            entries: entryConnection,
            handle: faker.random.alphaNumeric(faker.datatype.number({ min: 5, max: 10 })),
            name: JSON.stringify(`Blog ${i}`),
            updated: faker.date.recent().toISOString(),
            user: user,
            userId: userId,
        };

        blogs.push(blog);
    }

    const blogConnection: TestBlogConnection = {
        edges: blogs.map((blog) => ({
            node: blog,
            cursor: Buffer.from(blog.id).toString('base64'),
        })),
        pageInfo: {
            startCursor: "",
            endCursor: "",
            hasNextPage: false,
            hasPreviousPage: false,
            totalCount: 100
        },
    };

    return {
        blogs: blogConnection,
    };
};

const populateTemplates = (data: Export): string => {
    const blogEdges = data.blogs.edges.map(blogEdge => {
        const entries = blogEdge!.node.entries!.edges.map(entryEdge => {
            return template(entryTemplate)(entryEdge!);
        }).join(',\n');

        return template(blogTemplate)({
            ...blogEdge!.node,
            entries,
            user: template(userTemplate)(blogEdge!.node.user),
            cursor: ""
        });
    }).join(',\n');

    return template(exportTemplate)({ blogs: blogEdges });
};

// Generate data and populate templates
const data = generateData();
const populatedTsCode = populateTemplates(data);

// Write to TypeScript file
fs.writeFileSync('BlogsFixture.ts', populatedTsCode);


