/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import {Model} from "sequelize";

export class Blog extends Model {
    // use 'declare' to avoid shadowing model's getters/setters
    // https://sequelize.org/docs/v6/core-concepts/model-basics/#caveat-with-public-class-fields
    declare id: string;
    declare name: string;
    declare handle: string;
    declare created: Date;
    declare updated: Date;
    declare userId: string;
}