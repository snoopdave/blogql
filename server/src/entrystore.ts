/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import { v4 as uuid } from 'uuid';
import {DataSource} from 'apollo-datasource' ;
import {DataSourceConfig} from 'apollo-datasource/src';
import DBConnection from './dbconnection.js';
import {FindAllResult} from './pagination.js';
import {Node} from './node.js';
import sequelize from 'sequelize';
const { DataTypes, Model } = sequelize; // sequelize is a CommonJS module


export class Entry extends Model implements Node {
    declare id: string;
    declare blogId: string;
    declare title: string;
    declare content: string;
    declare created: Date;
    declare updated: Date;
}

export default class EntryStore implements DataSource<Entry> {
    db: sequelize.Sequelize;

    constructor(conn: DBConnection) {
        this.db = conn.db;
    }

    initialize?(config: DataSourceConfig<Entry>): void | Promise<void> {}

    async init() {
        Entry.init({
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            blogId: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'blog_id'
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false
            },
            created: {
                type: DataTypes.DATE,
                allowNull: false
            },
            updated: {
                type: DataTypes.DATE,
                allowNull: false
            },
        }, {
            sequelize: this.db,
            modelName: 'entry'
        });
        await Entry.sync();
    }

    async create(blogId: string, title: string, content: string) : Promise<Entry> {
        const now = new Date();
        const entry = Entry.build({ id: `${uuid()}-entry`, blogId, title, content, created: now, updated: now });
        await entry.save();
        return entry.get();
    }

    async retrieve(id: string) : Promise<Entry | null> {
        const entry = await Entry.findOne({ where: { id } });
        return entry?.get();
    }

    async countAll(blogId: string | null): Promise<number> {
        return blogId ? await Entry.count({ where: { blogId } }) : await Entry.count();
    }

    async retrieveAll(blogId: string, limit: number, offset: number) : Promise<FindAllResult<Entry>> {
        const result = await Entry.findAndCountAll({
            where: { blogId },
            limit: limit,
            offset: offset,
            order: [['updated', 'DESC']]
            //,logging: console.log
        });
        const rows: Entry[] = [];
        result.rows.map(entry => {
            rows.push(entry.get());
        });
        return { rows, count: await this.countAll(blogId) };
    }

    async update(id: string, title: string, content: string) : Promise<Entry | null> {
        const now = new Date();
        const [ number ] = await Entry.update({ title, content, updated: now },
            { where: { id } });
        if (number === 0) {
            throw Error('Entry not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple entries updated');
        }
        return this.retrieve(id);
    }

    async delete(id: string): Promise<void> {
        const number = await Entry.destroy({ where: { id } });
        if (number === 0) {
            throw Error('Entry not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple entries deleted');
        }
    }
}
