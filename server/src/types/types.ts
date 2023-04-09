/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */


import 'express-session';

declare module 'express-session' {
    interface Session {
        userId: string;
    }
}

