/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {config} from './config.js';

export enum LogLevel {
    DEBUG,
    INFO,
    ERROR,
}

export function log(logLevel: LogLevel, message: string) {
    if (logLevel <= config.logLevel) {
        console.log(`${logLevel}: ${message}`);
    }
}
