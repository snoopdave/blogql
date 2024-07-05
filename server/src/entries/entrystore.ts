/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {v4 as uuid} from 'uuid';
import {DataSource} from 'apollo-datasource';
import {DataSourceConfig} from 'apollo-datasource/src';
import DBConnection from '../dbconnection.js';
import {FindAllResult} from '../pagination.js';
import sequelize, {Op} from 'sequelize';
import {WhereOptions} from "sequelize/types/model";
import {Entry} from "./entry.js";

const { DataTypes} = sequelize; // sequelize is a CommonJS module

export class EntryStore implements DataSource<Entry> {
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
            published: {
                type: DataTypes.DATE,
                allowNull: true
            },
        }, {
            sequelize: this.db,
            modelName: 'entry'
        });
        await Entry.sync();
    }

    async create(blogId: string, title: string, content: string) : Promise<Entry> {
        const now = new Date();
        const entry = Entry.build({
            id: `${uuid()}-entry`,
            blogId,
            title,
            content,
            created: now,
            updated: now,
            published: null
        });
        await entry.save();
        return entry.get();
    }

    async retrieve(id: string) : Promise<Entry | null> {
        const entry = await Entry.findOne({ where: { id } });
        return entry?.get();
    }

    async countAll(where: WhereOptions): Promise<number> {
        return await Entry.count({ where });
    }

    async retrieveAllWhere(limit: number, offset: number, where: WhereOptions) : Promise<FindAllResult<Entry>> {
        const result = await Entry.findAndCountAll({
            where,
            limit,
            offset,
            order: [['updated', 'DESC']],
            logging: console.log
        });
        const rows: Entry[] = [];
        result.rows.map(entry => {
            rows.push(entry.get());
        });
        return { rows, count: await this.countAll(where), totalCount: result.count }; // TODO: why is countAll necessary
    }

    async retrieveAll(blogId: string, limit: number, offset: number) : Promise<FindAllResult<Entry>> {
        return this.retrieveAllWhere(limit, offset, { blogId, [Op.not]: { published: null }} );
    }

    async retrieveAllDrafts(blogId: string, limit: number, offset: number) : Promise<FindAllResult<Entry>> {
        return this.retrieveAllWhere(limit, offset, { blogId, published: null });
    }

    async update(id: string, title: string, content: string) : Promise<Entry | null> {
        await Entry.findOne({ where: { id } });
        const now = new Date();
        const [ number ] = await Entry.update({
                title,
                content,
                updated: now
            },
            { where: { id } });
        if (number === 0) {
            throw Error('Entry not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple entries updated');
        }
        return this.retrieve(id);
    }

    async doPublish(id: string, now: Date | null) : Promise<Entry | null> {
        const [ number ] = await Entry.update({
                published: now
            },
            { where: { id } });
        if (number === 0) {
            throw Error('Entry not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple entries updated');
        }
        return this.retrieve(id);
    }

    async unPublish(id: string) : Promise<Entry | null> {
        return this.doPublish(id, null);
    }

    async publish(id: string) : Promise<Entry | null> {
        return this.doPublish(id, new Date());
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
