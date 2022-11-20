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

export const DEBUG = "DEBUG";
export const ERROR= "ERROR";
export const INFO = "INFO";

type LogLevelString = keyof typeof LogLevel;

export function log(logLevel: LogLevelString, message: string) {
    if (LogLevel[logLevel] >= config.logLevel) {
        console.log(`${logLevel}: ${message}`);
    }
}
