/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {v4 as uuid} from 'uuid';
import sequelize from 'sequelize';
import {DataSource} from 'apollo-datasource';
import DBConnection from '../utils/dbconnection.js';
import {DataSourceConfig} from 'apollo-datasource/src';
import {FindAllResult} from '../pagination.js';
import {Blog} from "./blog.js";


export default class BlogStore implements DataSource<Blog> {
    db: sequelize.Sequelize;

    constructor(conn: DBConnection) {
        this.db = conn.db;
    }

    initialize?(config: DataSourceConfig<Blog>): void | Promise<void> {
    }

    async init() {
        await Blog.initialize(this.db);
    }

    async create(userId: string, handle: string, name: string): Promise<Blog> {
        let blog = await this.retrieveByUserId(userId);
        if (!blog) {
            const now = new Date();
            const blog = Blog.build({id: `${uuid()}-blog`, userId, name, handle, created: now, updated: now});
            await blog.save();
            return blog.get();
        }
        throw Error(`User ${userId} already has blog ${blog.handle}`);
    }

    async update(id: string, name: string): Promise<Blog | null> {
        const [number] = await Blog.update({name}, {where: {id}});
        if (number === 0) {
            throw Error('Blog not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple blogs updated');
        }
        return this.retrieveById(id);
    }

    async retrieve(handle: string): Promise<Blog | null> {
        const blog = await Blog.findOne({where: {handle}});
        return blog?.get()
    }

    async retrieveById(id: string): Promise<Blog | null> {
        const blog = await Blog.findOne({where: {id}});
        return blog?.get()
    }

    async retrieveByUserId(userId: string): Promise<Blog | null> {
        const blog = await Blog.findOne({where: {userId}});
        return blog?.get()
    }

    async retrieveAll(limit: number, offset: number): Promise<FindAllResult<Blog>> {
        const result = await Blog.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['updated', 'DESC']]
            //,logging: console.log
        });
        const rows: Blog[] = [];
        result.rows.map(blog => {
            rows.push(blog.get());
        });
        return {rows, count: await Blog.count(), totalCount: result.count};
    }

    async delete(id: string): Promise<void> {
        const number = await Blog.destroy({where: {id}});
        if (number === 0) {
            throw Error('Blog not found');
        } else if (number > 1) {
            throw Error('Unexpected outcome: multiple blogs deleted');
        }
    }
}