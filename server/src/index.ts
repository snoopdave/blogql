/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from './utils/dbconnection.js';
import resolvers from './resolvers.js';
import {User} from './users/user.js';
import BlogQL from './blogql.js';
import {DEBUG, INFO, log} from './utils/utils.js';
import {readFileSync} from 'fs';
import {config} from './utils/config.js';
import ApiKeyStore from "./apikeys/apikeystore.js";
import {BlogService, BlogServiceSequelizeImpl} from "./blogservice.js";
import {UserStore} from "./users/userstore.js";
import {expressMiddleware} from "@apollo/server/express4";
import http from 'http';
import pkg from 'body-parser';
import {ApolloServer} from "@apollo/server";
import cors from 'cors';
import gql from 'graphql-tag';

const { json } = pkg;

const blogQL = new BlogQL();
const httpServer = http.createServer(blogQL.app);

export interface BlogQLContext {
    blogService: BlogService | null;
    user: User | null;
}

// TODO: enable reporting
// const plugins = process.env.APOLLO_KEY ? [
//         ApolloServerPluginSchemaReporting({
//             endpointUrl: process.env.APOLLO_SCHEMA_REPORTING_URL,
//         }),
//         ApolloServerPluginUsageReporting({
//             endpointUrl: process.env.APOLLO_USAGE_REPORTING_URL,
//         }),
//     ] : [];

const typeDefs = gql(readFileSync('schema.graphql', 'utf8'));

// ApolloServer provides GraphQL API for blogging
const apolloServer = new ApolloServer<BlogQLContext>({
    typeDefs,
    resolvers,
    //plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// This oddness is working around the lack of top-level await
(async () => {
    await apolloServer.start();
})();

// Wait a sec or two for server start
setTimeout(function() {

    // Hook Apollo Server into Express as middleware
    blogQL.app.use('/graphql',
        cors({ origin: [config.corsOrigin, 'https://studio.apollographql.com'] }),
        json(),
        expressMiddleware(apolloServer, {
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
                            throw new Error('User not found');
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
                        throw new Error('User not found');
                    }
                }

                return {
                    user: null,
                    blogService: new BlogServiceSequelizeImpl(user, conn, null, null, null, null)
                } as BlogQLContext;
            },
        }));
    let port = 4000;
    log(INFO, `🚀 BlogQL starting at http://localhost:${port}/graphql`);
    blogQL.startBlogQL(port);
}, 2000);

