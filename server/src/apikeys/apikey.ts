/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Node} from "../types/node";
import {Model} from "sequelize";

export class ApiKey extends Model implements Node {
    declare id: string;
    declare userId: string;
    declare apiKey: string;
    declare created: string;
}
