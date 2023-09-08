/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BlogConnection} from "../gql/graphql";

export interface Export {
    blogs: BlogConnection;
}

