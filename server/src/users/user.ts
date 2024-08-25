/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import { Model, DataTypes, Sequelize } from 'sequelize';

/**
 * Represents a user in the system.
 */
export class User extends Model {
    public readonly id!: string;
    public username!: string;
    public email!: string;
    public picture!: string;
    public readonly created!: Date;
    public updated!: Date;

    /**
     * Initializes the User model.
     * @param db The database connection.
     */
    public static async initialize(db: Sequelize): Promise<void> {
        User.init({
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            picture: {
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
            }
        }, {
            sequelize: db,
            modelName: 'user'
        });
        await User.sync();
    }
}

