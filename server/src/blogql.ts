/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import express from 'express';
import {OAuth2Client} from 'google-auth-library';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import session from 'express-session';
import {EntryStore} from './entrystore.js';
import {User, UserStore} from "./userstore.js";
import {log, LogLevel} from './utils.js';
import {config} from './config.js';


export default class BlogQL {
    app = express();
    client = new OAuth2Client(process.env.CLIENT_ID);
    jsonParser = bodyParser.json();

    constructor(entryStore: EntryStore, userStore: UserStore) {
        dotenv.config();

        this.app.use('*', function(req, res, next) {
            // There is also some CORS setup in index.ts
            log(LogLevel.DEBUG, `Setting CORs headers ${req.method} ${req.originalUrl}`);
            res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        this.app.use(session({
            secret: 'squawk turtle', // TODO: make this an env var
            saveUninitialized: true,
            resave: false
        }));

        this.app.get('/me',
            async (req, res) => {
                //console.log(JSON.stringify(req.session, null, 4));
                if (req.session?.userId) {
                    const user = await userStore.retrieve(req.session?.userId);
                    if (!user) {
                        res.status(500);
                    } else {
                        res.status(200);
                        res.json(user);
                    }
                } else {
                    res.status(401);
                }
                log(LogLevel.DEBUG, `GET ${req.originalUrl} ${res.statusCode}`);
                res.end();
            });

        this.app.post(
            '/auth',
            this.jsonParser,
            async (req,  res) => {
                console.log(JSON.stringify(req.session, null, 4));
                const {token} = req.body
                const ticket = await this.client.verifyIdToken({
                    idToken: token,
                    audience: process.env.CLIENT_ID
                });
                const {name, email, picture} = ticket.getPayload()!;
                const user: User = await userStore.upsert(name!, email!, picture!);
                req.session.userId = user.id;
                log(LogLevel.DEBUG, `Logged in as username 
                    ${user.username}/${req.session.userId} in session.id=${req.session.id}`);
                res.status(201)
                res.json(user);
                log(LogLevel.DEBUG, `POST ${req.originalUrl} ${res.statusCode}`);
                res.end();
            });

        this.app.delete('/logout',
            async (req, res) => {
                await req.session.destroy(() => {
                    log(LogLevel.DEBUG, 'Logged out');
                });
                res.status(200)
                res.json({
                    message: 'Logged out successfully'
                });
                log(LogLevel.DEBUG, `DELETE ${req.originalUrl} ${res.statusCode}`);
                res.end();
            });
    }

    start(port: number) {
        this.app.listen(port);
    }
}



