/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ApolloServer} from 'apollo-server-express';
import {ApolloServerPluginSchemaReporting, ApolloServerPluginUsageReporting} from 'apollo-server-core';
import DBConnection from './dbconnection.js';
import resolvers from './resolvers.js';
import {User, UserStore} from './userstore.js';
import BlogQL from './blogql.js';
import {AuthenticationError, gql} from 'apollo-server';
import {DEBUG, INFO, log} from './utils.js';
import {readFileSync} from 'fs';
import {config} from './config.js';
import {ApiKeyStore} from "./apikeystore.js";
import {BlogService, BlogServiceSequelizeImpl} from "./blogservice.js";

export interface BlogQLContext {
    readonly blogService: BlogService;
    readonly user: User | null;
}

const plugins = process.env.APOLLO_KEY ? [
        ApolloServerPluginSchemaReporting({
            endpointUrl: process.env.APOLLO_SCHEMA_REPORTING_URL,
        }),
        ApolloServerPluginUsageReporting({
            endpointUrl: process.env.APOLLO_USAGE_REPORTING_URL,
        }),
    ] : [];

const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

// ApolloServer provides GraphQL API for blogging
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {

        let user: User | null = null;
        const conn = new DBConnection(config.filePath);
        const userStore = new UserStore(conn);
        await userStore.init();

        if (req.session) {
            log(DEBUG, `Session: ${req.session.id}`);
            if (req.session.userId) {
                user = await userStore.retrieve(req.session.userId);
                if (user) {
                    log(DEBUG, `User login ${req.session.userId}`);
                } else {
                    throw new AuthenticationError('User not found');
                }
            }
        }

        const apiKey = req.get('x-api-key');
        if (apiKey) {
            const apiKeyStore = new ApiKeyStore(conn);
            await apiKeyStore.init();
            const userId = await apiKeyStore.lookupUserId(apiKey);
            user = await userStore.retrieve(userId);
            if (user) {
                log(DEBUG, `API key auth ${req.session.userId}`);
            } else {
                throw new AuthenticationError('User not found');
            }
        }

        return {
            user: undefined,
            blogService: new BlogServiceSequelizeImpl(user, conn)
        };
    },
    plugins,
});

// This oddness is working around the lack of top-level await
(async () => {
    await apolloServer.start();
})();

// Wait a sec for the server.start() to be called
setTimeout(function() {
    // Express app provides REST API for authentication
    const blogQL = new BlogQL();
    apolloServer.applyMiddleware({
        app: blogQL.app,
        cors: { // There is also some CORS setup in blogql.ts
            origin: config.corsOrigin,
            credentials: true
        },
    });
    let port = 4000;
    log(INFO, `🚀 BlogQL starting at http://localhost:${port}/graphql`);
    blogQL.startBlogQL(port);
}, 2000);

