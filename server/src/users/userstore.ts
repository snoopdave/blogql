/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import DBConnection from '../utils/dbconnection.js';
import {v4 as uuid} from 'uuid';
import sequelize from 'sequelize';
import {DataSource} from 'apollo-datasource';
import {DataSourceConfig} from 'apollo-datasource/src';
import {FindAllResult} from '../pagination.js';
import {User} from "./user.js";

export class UserStore implements DataSource<User> {
    db: sequelize.Sequelize;

    constructor(conn: DBConnection) {
        this.db = conn.db;
    }

    initialize?(config: DataSourceConfig<User>): void | Promise<void> {}

    async init() {
        await User.initialize(this.db);
    }

    async create(username: string, email: string, picture: string): Promise<User> {
        const now = new Date();
        const user = User.build({ id: `${uuid()}-user`, username, email, picture, created: now, updated: now });
        await user.save();
        return user.get();
    }

    async retrieve(id: string) : Promise<User | null> {
        const user = await User.findOne({where: {id}});
        return user?.get();
    }

    async retrieveByEmail(email: string) : Promise<User | null> {
        const user = await User.findOne({where: {email}});
        return user?.get();
    }

    async retrieveAll(limit: number, offset: number) : Promise<FindAllResult<User>> {
        const result = await User.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['updated', 'DESC']]
            //,logging: console.log
        });
        const rows: User[] = [];
        result.rows.map(user => {
            rows.push(user.get());
        });
        return { rows, count: await User.count(), totalCount: result.count};
    }

    async update(id: string, username: string, picture: string) : Promise<User | null> {
        const now = new Date();
        const [ number ] = await User.update({ username, picture, updated: now }, { where: { id } });
        if (number === 0) {
            throw Error('User not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple users updated');
        }
        return this.retrieve(id);
    }

    async upsert(username: string, email: string, picture: string) {
        let user: User | null = await this.retrieveByEmail(email);
        return user ?? await this.create(username, email, picture);
    }

    async delete(id: string) {
        const number = await User.destroy({ where: { id } });
        if (number === 0) {
            throw Error('User not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple users deleted');
        }
    }
}
