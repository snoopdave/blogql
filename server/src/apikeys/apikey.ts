/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import { Model, DataTypes, Sequelize } from 'sequelize';

export class ApiKey extends Model {
    declare id: string;
    declare userId: string;
    declare apiKey: string;
    declare created: string;

    public static async initialize(sequelize: Sequelize): Promise<void> {
        ApiKey.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false
            },
            apiKey: {
                type: DataTypes.STRING,
                allowNull: false
            },
            created: {
                type: DataTypes.DATE,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'ApiKey',
            createdAt: 'created',
            updatedAt: 'updated'
        });
        await ApiKey.sync();
    }
}