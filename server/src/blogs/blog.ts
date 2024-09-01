/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import { Model, DataTypes, Sequelize } from "sequelize";

export class Blog extends Model {
    declare id: string;
    declare name: string;
    declare handle: string;
    declare created: Date;
    declare updated: Date;
    declare userId: string;

    static async initialize(sequelize: Sequelize): Promise<void> {
        Blog.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            handle: {
                type: DataTypes.STRING,
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
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: 'Blog',
            tableName: 'blogs',
            timestamps: false,
        });
        await Blog.sync();
    }
}