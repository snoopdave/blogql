/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from '../dbconnection.js';
import {randomString} from "../utils.js";
import {ApiKeyStore} from "./apikeystore.js";


async function createApiKeyStore(): Promise<{ apiKeyStore: ApiKeyStore, conn: DBConnection }> {
    const slug = randomString(5);
    const conn = new DBConnection(`./db-test-${slug}.db`);
    const apiKeyStore = new ApiKeyStore(conn);
    await apiKeyStore.init();
    return { apiKeyStore, conn };
}
describe('Test ApiKeyStore', () => {

    test('It can connect to apikey store', async () => {
        const { apiKeyStore, conn } = await createApiKeyStore();
        try {
            expect(apiKeyStore.db).toBeDefined();
        } finally {
            await conn.destroy();
        }
    });

    test('It can issue new API key that can be verified', async () => {
        const { apiKeyStore, conn } = await createApiKeyStore();
        try {
            const userId = 'dummy id string';
            const key = await apiKeyStore.issue(userId);
            expect(key).toBeDefined();

            const keyIsValid = await apiKeyStore.verify(userId, key);
            expect(keyIsValid).toBe(true);
            expect(await apiKeyStore.lookupUserId(key)).toBe(userId);

        } finally {
            await conn.destroy();
        }
    });

    test('It can re-issue an API key', async () => {
        const { apiKeyStore, conn } = await createApiKeyStore();
        try {
            const userId = 'dummy id string';
            const key = await apiKeyStore.issue(userId);
            expect(key).toBeDefined();
            expect(await apiKeyStore.verify(userId, key)).toBe(true);
            expect(await apiKeyStore.lookupUserId(key)).toBe(userId);

            const newKey = await apiKeyStore.issue(userId);
            expect(newKey).not.toBe(key);
            expect(await apiKeyStore.verify(userId, newKey)).toBe(true);
            expect(await apiKeyStore.verify(userId, key)).toBe(false);

        } finally {
            await conn.destroy();
        }
    });

    test('It will not verify a bogus API key', async () => {
        const { apiKeyStore, conn } = await createApiKeyStore();
        try {
            expect(await apiKeyStore.verify('dummy id', 'bogus key')).toBe(false);
        } finally {
            await conn.destroy();
        }
    });
});

export {}
