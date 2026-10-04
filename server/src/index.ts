/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from './utils/dbconnection.js';
import resolvers from './resolvers.js';
import {User} from './users/user.js';
import BlogQL from './blogql.js';
import {DEBUG, ERROR, INFO, log} from './utils/utils.js';
import {readFileSync} from 'fs';
import {config, isEmailAllowed} from './utils/config.js';
import ApiKeyStore from "./apikeys/apikeystore.js";
import {BlogService, BlogServiceSequelizeImpl} from "./blogservice.js";
import {UserStore} from "./users/userstore.js";
import BlogStore from "./blogs/blogstore.js";
import {EntryStore} from "./entries/entrystore.js";
import {expressMiddleware} from "@apollo/server/express4";
import pkg from 'body-parser';
import {ApolloServer} from "@apollo/server";
import cors from 'cors';
import gql from 'graphql-tag';

const { json } = pkg;

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

async function main() {

    // One database connection (and pool) for the whole process
    const conn = new DBConnection(config.filePath);
    const userStore = new UserStore(conn);
    const blogStore = new BlogStore(conn);
    const entryStore = new EntryStore(conn);
    const apiKeyStore = new ApiKeyStore(conn);
    await userStore.init();
    await blogStore.init();
    await entryStore.init();
    await apiKeyStore.init();

    await apolloServer.start();

    const blogQL = new BlogQL(userStore);

    // Hook Apollo Server into Express as middleware
    blogQL.app.use('/graphql',
        cors({ origin: [config.corsOrigin, 'https://studio.apollographql.com'] }),
        json(),
        expressMiddleware(apolloServer, {
            context: async ({ req }) => {

                let user: User | null = null;

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
                    const userId = await apiKeyStore.lookupUserId(apiKey);
                    user = await userStore.retrieve(userId);
                    if (user) {
                        log(DEBUG, `API key auth ${req.session.userId}`);
                    } else {
                        throw new Error('User not found');
                    }
                }

                // Users not in ALLOWED_EMAILS (old sessions, API keys) only get public access
                if (user && !isEmailAllowed(user.email)) {
                    log(INFO, `Ignoring credentials of user not allowed: ${user.email}`);
                    user = null;
                }

                return {
                    user: null,
                    blogService: new BlogServiceSequelizeImpl(
                        user, conn, blogStore, entryStore, userStore, apiKeyStore)
                } as BlogQLContext;
            },
        }));

    const port = Number(process.env.PORT) || 4000;
    log(INFO, `🚀 BlogQL starting at http://localhost:${port}/graphql`);
    blogQL.startBlogQL(port);
}

main().catch((err) => {
    log(ERROR, `BlogQL failed to start: ${err}`);
    process.exit(1);
});
