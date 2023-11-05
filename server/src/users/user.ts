/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import {Model} from "sequelize";

export class User extends Model {
    declare id: string;
    declare username: string;
    declare email: string;
    declare picture: string;
    declare created: Date;
    declare updated: Date
}
