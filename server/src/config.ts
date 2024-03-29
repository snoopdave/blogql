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
    corsOrigin: 'http://localhost:3000',
    // corsOrigin: 'https://studio.apollographql.com',
    logLevel: 0, // DEBUG
    filePath: undefined
}
