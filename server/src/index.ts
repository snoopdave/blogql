/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ApolloServer} from 'apollo-server-express';
import {ApolloServerPluginSchemaReporting, ApolloServerPluginUsageReporting} from "apollo-server-core";
import DBConnection from './dbconnection.js';
import EntryStore from './entrystore.js';
import resolvers from './resolvers.js';
import UserStore, {User} from './userstore.js';
import BlogQL from './blogql.js';
import {AuthenticationError, gql} from 'apollo-server';
import {DEBUG, ERROR, INFO, log, LogLevel} from './utils.js';
import BlogStore from './blogstore.js';
import {readFileSync} from 'fs';
import {config} from './config.js';

// Data sources
let conn = new DBConnection('./db-test1.db');
const blogStore = new BlogStore(conn);
const entryStore = new EntryStore(conn);
const userStore = new UserStore(conn);

// Express app provides REST API for authentication
let blogQL = new BlogQL(entryStore, userStore);

export const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

export interface BlogQLDataSources {
    readonly blogStore: BlogStore;
    readonly entryStore: EntryStore;
    readonly userStore: UserStore;
}

export interface BlogQLContext {
    readonly dataSources: BlogQLDataSources;
    readonly user: User | undefined;
}

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
        try {
            if (req.session) {
                log(DEBUG, `Session: ${req.session.id}`);
                if (req.session.userId) {
                    const user = await userStore.retrieve(req.session.userId);
                    if (user) {
                        log(DEBUG, `Logged in as ${req.session.userId}`);
                        return {user}; // Adds user to the context
                    }
                    throw new AuthenticationError('User not found');
                }
            }
        } catch (e) {
            log(ERROR, `Error checking auth`);
        }
    },
    plugins: [
    	ApolloServerPluginSchemaReporting({
      		endpointUrl: process.env.APOLLO_SCHEMA_REPORTING_URL,
    	}),
        ApolloServerPluginUsageReporting({
            endpointUrl: process.env.APOLLO_USAGE_REPORTING_URL,
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
    log(INFO, `🚀 BlogQL running at http://localhost:${port}/graphql`);
    blogQL.start(port);
}, 1000);


