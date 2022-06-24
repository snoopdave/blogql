/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from '../dbconnection';
import UserStore, {User} from '../userstore';
import {expect, test} from '@jest/globals';
import EntryStore from '../entrystore';
import {FindAllResult} from '../pagination';


export function randomString(length: number) {
    const allLowerAlpha = [...'abcdefghijklmnopqrstuvwxyz'];
    const allNumbers = [...'0123456789'];
    const base = [...allNumbers, ...allLowerAlpha];
    return [...Array(length)].map(() => base[Math.random() * base.length | 0]).join('');
}


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
        let slug = randomString(5);
        let conn = new DBConnection(`./db-test-${slug}.db`);
        let us = new UserStore(conn);
        await us.init();
        try {
            const userCreated = await us.create(
                'snoopdave',
                'snoopdave@example.com',
                'http://example.com/img/snoopdave.jpg'
            );
            expect(userCreated).toHaveProperty('id');
            expect(userCreated).toHaveProperty('created');
            expect(userCreated).toHaveProperty('updated');

            const userRetrieved = await us.retrieve(userCreated.id);
            expect(userRetrieved).toHaveProperty('id');
            expect(userRetrieved).toHaveProperty('created');
            expect(userRetrieved).toHaveProperty('updated');

            const entriesRetrieved: FindAllResult<User> = await us.retrieveAll(10, 0);
            expect(entriesRetrieved.rows).toHaveLength(1);

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
            let user = await us.upsert('Test User', 'test@example.com', 'http://example.com/test.png');
            expect(user).toBeDefined();
            expect(user.email).toBe('test@example.com');
            expect(user.username).toBe('Test User');
            expect(user.picture).toBe('http://example.com/test.png');

            user = await us.upsert('Test User1', 'test1@example.com', 'http://example.com/test1.png');
            expect(user).toBeDefined();
            expect(user.email).toBe('test1@example.com');
            expect(user.username).toBe('Test User1');
            expect(user.picture).toBe('http://example.com/test1.png');
        } finally {
            await conn.destroy();
        }
    });
});
