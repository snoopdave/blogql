/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import {LogLevel} from './utils.js';

export interface Config {
    corsOrigin: string;
    logLevel: LogLevel;
    auth: boolean;
    filePath: string | undefined;
}

export const config: Config = {
    auth: false,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    // corsOrigin: 'https://studio.apollographql.com',
    logLevel: 0, // DEBUG
    filePath: process.env.SQLITE_DATA_PATH
}

/**
 * Only these Google accounts may log in, from ALLOWED_EMAILS (comma-separated).
 * If the list is empty, everyone may log in, except in production, where nobody may.
 * Reads the environment on each call, because dotenv loads after this module.
 */
export function isEmailAllowed(email: string | null | undefined): boolean {
    const allowed = (process.env.ALLOWED_EMAILS ?? '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);
    if (allowed.length === 0) {
        return process.env.NODE_ENV !== 'production';
    }
    return !!email && allowed.includes(email.trim().toLowerCase());
}
