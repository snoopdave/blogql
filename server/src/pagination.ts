/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {appendFileSync} from 'fs';

export class Response<T> {
    nodes: T[];
    pageInfo: PageInfo;
    constructor(nodes: T[], pageInfo: PageInfo) {
        this.nodes = nodes;
        this.pageInfo = pageInfo;
    }
}

export class PageInfo {
    cursor?: string | null;
    totalCount: Number;
    constructor(cursor: string | null, totalCount: Number) {
        this.cursor = cursor;
        this.totalCount = totalCount;
    }
}

export class Cursor {
    limit!: number;
    offset!: number;
    constructor(limit: number, offset: number) {
        this.limit = limit;
        this.offset = offset;
    }
}

export class FindAllArgs {
    limit: number;
    cursor: string;
    constructor(limit: number, cursor: string) {
        this.limit = limit;
        this.cursor = cursor;
    }
}

export class FindAllResult<T> {
    rows: T[];
    count: number;
    constructor(rows: T[], count: number) {
        this.rows = rows;
        this.count = count;
    }
}

export function decodeCursor(cursor: string): Cursor {
    let cursorJson = Buffer.from(cursor, `base64`).toString(`binary`);
    return JSON.parse(cursorJson);
}

export function encodeCursor(cursor: Cursor): string {
    let cursorJson  = JSON.stringify(cursor);
    return Buffer.from(cursorJson, 'binary').toString('base64');
}

function log(msg: string) {
    appendFileSync('/tmp/jest.log.txt', msg + '\n', {'encoding': 'utf8'});
}

export async function resolveCollection<T>(args: FindAllArgs,
    fetchData: (cursor: Cursor) => Promise<FindAllResult<T>>): Promise<Response<T>> {
    try {
        let offset = 0;
        if (args.cursor) {
            let cursorDecoded = decodeCursor(args.cursor);
            args.limit = cursorDecoded.limit;
            offset = cursorDecoded.offset;
        }
        args.limit = args.limit ? args.limit : 10;
        const cursor = new Cursor(args.limit, offset);

        let result = await fetchData(cursor);

        let pageInfo = new PageInfo(null, result.count);
        if (result.rows.length > args.limit) {
            let cursor = { limit: args.limit, offset: offset + args.limit };
            pageInfo.cursor = encodeCursor(cursor);
            result.rows = result.rows.slice(0, args.limit);
        }
        return new Response<T>(result.rows, pageInfo);
    } catch (e) {
        throw e;
    }
}