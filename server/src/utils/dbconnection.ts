/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import fs from 'fs';
import sequelize from 'sequelize';
import {ERROR, INFO, log} from "./utils.js";


export default class DBConnection {
    path: string | undefined = undefined;
    db: sequelize.Sequelize;

    constructor(filePath: string | undefined) {
        if (process.env.POSTGRES_HOSTNAME) {
            this.db = new sequelize.Sequelize(`postgres://${process.env.POSTGRES_USERNAME}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOSTNAME}/${process.env.POSTGRES_DATABASE}`);
        } else {
            // fall back to SQLite
            this.path = filePath || 'db-test1.db';
            log(INFO, `Connecting to SQLite3 ${this.path}`);
            this.db = new sequelize.Sequelize({
                dialect: 'sqlite',
                storage: this.path,
                logging: false
            });
        }
    }

    async destroy() {
        if (this.path) {
            try {
                fs.unlinkSync(this.path);
            } catch (e) {
                log(ERROR, `Cannot delete file ${this.path} due to ${e}`);
            }
        }
    }
}