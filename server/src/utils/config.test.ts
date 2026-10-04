/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {afterEach, describe, expect, test} from '@jest/globals';
import {isEmailAllowed} from './config.js';

describe('isEmailAllowed', () => {
    const saved = {
        ALLOWED_EMAILS: process.env.ALLOWED_EMAILS,
        NODE_ENV: process.env.NODE_ENV,
    };

    afterEach(() => {
        for (const [key, value] of Object.entries(saved)) {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        }
    });

    test('allows only listed emails, ignoring case and spaces', () => {
        process.env.ALLOWED_EMAILS = ' Alice@Gmail.com , bob@gmail.com';
        expect(isEmailAllowed('alice@gmail.com')).toBe(true);
        expect(isEmailAllowed('BOB@gmail.com')).toBe(true);
        expect(isEmailAllowed('mallory@gmail.com')).toBe(false);
        expect(isEmailAllowed(undefined)).toBe(false);
    });

    test('empty list allows everyone outside production', () => {
        delete process.env.ALLOWED_EMAILS;
        process.env.NODE_ENV = 'test';
        expect(isEmailAllowed('anyone@gmail.com')).toBe(true);
    });

    test('empty list allows nobody in production', () => {
        process.env.ALLOWED_EMAILS = '';
        process.env.NODE_ENV = 'production';
        expect(isEmailAllowed('anyone@gmail.com')).toBe(false);
    });
});
