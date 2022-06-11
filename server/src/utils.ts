
export enum LogLevel {
    ERROR,
    INFO,
    DEBUG
}

export interface Config {
    corsOrigin: string;
    logLevel: LogLevel;
    auth: boolean;
}

export const config: Config = {
    auth: false,
    corsOrigin: "http://localhost:3000",
    logLevel: LogLevel.DEBUG
}

export function log(logLevel: LogLevel, message: string) {
    if (logLevel <= config.logLevel) {
        console.log(`${LogLevel[logLevel]}: ${message}`);
    }
}
