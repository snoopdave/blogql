/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ApolloServer} from 'apollo-server-express';
import {ApolloServerPluginSchemaReporting, ApolloServerPluginUsageReporting} from 'apollo-server-core';
import DBConnection from './dbconnection.js';
import {EntryStore} from './entrystore.js';
import resolvers from './resolvers.js';
import {User, UserStore} from './userstore.js';
import BlogQL from './blogql.js';
import {AuthenticationError, gql} from 'apollo-server';
import {DEBUG, INFO, log} from './utils.js';
import BlogStore from './blogstore.js';
import {readFileSync} from 'fs';
import {config} from './config.js';
import {ApiKeyStore} from "./apikeystore.js";
import {BlogService, BlogServiceSequelizeImpl} from "./blogservice";

// Data sources
let appConn = new DBConnection(undefined);
const blogStore = new BlogStore(appConn);
const entryStore = new EntryStore(appConn);
const userStore = new UserStore(appConn);
const apiKeyStore = new ApiKeyStore(appConn);

// Express app provides REST API for authentication
let blogQL = new BlogQL(entryStore, userStore);

const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

export interface BlogQLDataSources {
    readonly blogStore: BlogStore;
    readonly entryStore: EntryStore;
    readonly userStore: UserStore;
    readonly apiKeyStore: ApiKeyStore;
}

export interface BlogQLContext {
    readonly blogService: BlogService;
    readonly user: User | undefined;
}

const plugins = process.env.APOLLO_KEY ? [
        ApolloServerPluginSchemaReporting({
            endpointUrl: process.env.APOLLO_SCHEMA_REPORTING_URL,
        }),
        ApolloServerPluginUsageReporting({
            endpointUrl: process.env.APOLLO_USAGE_REPORTING_URL,
        }),
    ] : [];

// ApolloServer provides GraphQL API for blogging
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        blogStore,
        entryStore,
        userStore,
        apiKeyStore,
    }),
    context: async ({ req }) => {
        if (req.session) {
            log(DEBUG, `Session: ${req.session.id}`);
            if (req.session.userId) {
                const user = await userStore.retrieve(req.session.userId);
                if (user) {
                    log(DEBUG, `Logged in as ${req.session.userId}`);
                    const blogService: BlogService = new BlogServiceSequelizeImpl(user, {
                        blogStore,
                        entryStore,
                        userStore,
                        apiKeyStore,
                    });
                    return { user, blogService }; // Add to context
                }
                throw new AuthenticationError('User not found');
            }
        }
        const apiKey = req.get('x-api-key');
        if (apiKey) {
            const userId = await apiKeyStore.lookupUserId(apiKey);
            const user = await userStore.retrieve(userId);
            return { user };
        }
    },
    plugins,
});

// This oddness is working around the lack of top-level await
(async () => {
    await blogStore.init();
    await entryStore.init();
    await userStore.init();
    await apiKeyStore.init();
    await apolloServer.start();
})();

// Wait a sec for the server.start() to be called
setTimeout(function() {
    apolloServer.applyMiddleware({
        app: blogQL.app,
        cors: { // There is also some CORS setup in blogql.ts
            origin: config.corsOrigin,
            credentials: true
        },
    });
    let port = 4000;
    log(INFO, `🚀 BlogQL running at http://localhost:${port}/graphql`);
    blogQL.startBlogQL(port);
}, 2000);

