/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import fs from 'fs';
import sequelize from 'sequelize';
import {log, LogLevel} from './utils.js';
import {config} from './config.js';


export default class DBConnection {
    path: string;
    db: sequelize.Sequelize;

    constructor(path: string) {
        this.path = path;
        this.db = new sequelize.Sequelize({
            dialect: 'sqlite',
            storage: path,
            //logging: config.logLevel >= LogLevel.INFO,
            logging: false,
        });
    }

    async destroy() {
        try {
            fs.unlinkSync(this.path);
        } catch (e) {
            log(LogLevel.ERROR, `Cannot delete file ${this.path} due to ${e}`);
        }
    }
}