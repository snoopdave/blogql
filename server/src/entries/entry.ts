/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Node} from "../types/node";
import {DataTypes, Model, Sequelize} from "sequelize";


export class Entry extends Model implements Node {
    declare id: string;
    declare blogId: string;
    declare title: string;
    declare content: string;
    declare created: Date;
    declare updated: Date;
    declare published: Date | null;

    static async initialize(sequelize: Sequelize) {
        Entry.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            blogId: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'blog_id'
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            created: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updated: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            published: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        }, {
            sequelize,
            modelName: 'Entry',
            createdAt: 'created',
            updatedAt: 'updated'
        });

        await Entry.sync();
    }
}
