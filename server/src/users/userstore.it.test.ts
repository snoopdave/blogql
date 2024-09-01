/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from '../utils/dbconnection.js';
import {UserStore} from './userstore.js';
import {expect, test} from '@jest/globals';
import {EntryStore} from '../entries/entrystore.js';
import {FindAllResult} from '../pagination.js';
import {randomString} from "../utils/utils.js";
import {User} from "./user.js";


describe('Test UserStore', () => {

    test('It can connect to user store', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let us = new UserStore(conn);
        await us.init();
        try {
            expect(us.db).toBeDefined();
        } finally {
            await conn.destroy();
        }
    });

    test('It can CRUD a user', async () => {
        let slug = randomString(6);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let us = new UserStore(conn);
        await us.init();
        try {
            const userCreated = await us.create(
                'snoopdave',
                'snoopdave@example.com',
                'https://example.com/img/snoopdave.jpg'
            );
            expect(userCreated).toEqual(expect.objectContaining({
                id: expect.any(String),
                created: expect.any(Date),
                updated: expect.any(Date),
                username: 'snoopdave',
                email: 'snoopdave@example.com',
                picture: 'https://example.com/img/snoopdave.jpg'
            }));

            const userRetrieved = await us.retrieve(userCreated.id);
            expect(userRetrieved).toEqual(expect.objectContaining({
                id: userCreated.id,
                created: userCreated.created,
                updated: userCreated.updated,
                username: 'snoopdave',
                email: 'snoopdave@example.com',
                picture: 'https://example.com/img/snoopdave.jpg'
            }));

            const entriesRetrieved: FindAllResult<User> = await us.retrieveAll(10, 0);
            expect(entriesRetrieved.rows).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: userCreated.id,
                    created: userCreated.created,
                    updated: userCreated.updated,
                    username: 'snoopdave',
                    email: 'snoopdave@example.com',
                    picture: 'https://example.com/img/snoopdave.jpg'
                })
            ]));

        } finally {
            await conn.destroy();
        }
    });

    test('It can page through users', async () => {
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let us = new UserStore(conn);
        await us.init();
        try {
            for (let i = 0; i < 25; i++) {
                await us.create(
                    `username${i}`,
                    `user${i}@example.com`,
                    `http://example.com/img/user${i}`);
            }

            const usersRetrieved = await us.retrieveAll(10, 0);
            expect(usersRetrieved.rows).toHaveLength(10);

            const usersRetrieved1 = await us.retrieveAll(10, 10);
            expect(usersRetrieved1.rows).toHaveLength(10);

            const usersRetrieved2 = await us.retrieveAll(10, 20);
            expect(usersRetrieved2.rows).toHaveLength(5);

            const usersRetrieved3 = await us.retrieveAll(10, 25);
            expect(usersRetrieved3.rows).toHaveLength(0);

        } finally {
            await conn.destroy();
        }
    });

    test('It can upsert a user', async () => {

        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        const es = new EntryStore(conn);
        await es.init();
        const us = new UserStore(conn);
        await us.init();

        try {
            let user = await us.upsert('Test User', 'test@example.com', 'https://example.com/test.png');
            expect(user).toEqual({
                id: expect.any(String),
                username: 'Test User',
                email: 'test@example.com',
                picture: 'https://example.com/test.png',
                created: expect.any(Date),
                updated: expect.any(Date)
            });

            user = await us.upsert('Test User1', 'test1@example.com', 'https://example.com/test1.png');
            expect(user).toEqual({
                id: expect.any(String),
                username: 'Test User1',
                email: 'test1@example.com',
                picture: 'https://example.com/test1.png',
                created: expect.any(Date),
                updated: expect.any(Date)
            });
        } finally {
            await conn.destroy();
        }
    });
});

export {}
