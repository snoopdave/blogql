/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Node} from "../types/node";
import {Model} from "sequelize";


export class Entry extends Model implements Node {
    declare id: string;
    declare blogId: string;
    declare title: string;
    declare content: string;
    declare created: Date;
    declare updated: Date;
    declare published: Date | null;
}
