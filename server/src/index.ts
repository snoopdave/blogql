/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ApolloServer} from 'apollo-server-express';
import DBConnection from './dbconnection.js';
import EntryStore from './entrystore.js';
import resolvers from './resolvers.js';
import UserStore from './userstore.js';
import BlogQL from './blogql.js';
import {AuthenticationError, gql} from 'apollo-server';
import {log, LogLevel} from './utils.js';
import BlogStore from './blogstore.js';
import {readFileSync} from 'fs';
import { ApolloServerPluginSchemaReporting } from 'apollo-server-core';
import {config} from './config.js';

// Data sources
let conn = new DBConnection('./db-test1.db');
const blogStore = new BlogStore(conn);
const entryStore = new EntryStore(conn);
const userStore = new UserStore(conn);

// Express app provides REST API for authentication
let blogQL = new BlogQL(entryStore, userStore);

export const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

// ApolloServer provides GraphQL API for blogging
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        blogStore,
        entryStore,
        userStore
    }),
    context: async ({ req }) => {
        if (req.session) {
            log(LogLevel.DEBUG, `Session: ${req.session.id}`);
            if (req.session.userId) {
                const user = await userStore.retrieve(req.session.userId);
                if (user) {
                    log(LogLevel.DEBUG, `Logged in as ${req.session.userId}`);
                    return { user }; // Adds user to the context
                }
                throw new AuthenticationError('User not found');
            }
        }
    },
    plugins: [
        ApolloServerPluginSchemaReporting({
            endpointUrl: process.env.APOLLO_SCHEMA_REPORTING_ENDPOINT
        }),
    ],
});

// This oddness is working around the lack of top-level await
(async () => {
    await blogStore.init();
    await entryStore.init();
    await userStore.init();
    await server.start();
})();

// Wait a sec for the server.start() to be called
setTimeout(function() {
    server.applyMiddleware({
        app: blogQL.app,
        cors: { // There is also some CORS setup in blogql.ts
            origin: config.corsOrigin,
            credentials: true
        },
    });
    let port = 4000;
    log(LogLevel.INFO, `🚀 BlogQL running at http://localhost:${port}/graphql`);
    blogQL.start(port);
}, 1000);


