/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {appendFileSync} from 'fs';

export class ResponseConnection<T extends ResponseEdge<any>> {
    edges: T[];
    pageInfo: PageInfo;
    constructor(edges: T[], pageInfo: PageInfo) {
        this.edges = edges;
        this.pageInfo = pageInfo;
    }
}

export class ResponseEdge<T> {
    node: T;
    cursor: String;
    constructor(node: T, cursor: String) {
        this.node = node;
        this.cursor = cursor;
    }
}

export class PageInfo {
    hasNextPage: Boolean;
    hasPreviousPage: Boolean;
    startCursor: String;
    endCursor: String;
    constructor(hasNextPage: Boolean, hasPreviousPage: Boolean, startCursor: String, endCursor: String) {
        this.hasNextPage = hasNextPage;
        this.hasPreviousPage = hasPreviousPage;
        this.startCursor = startCursor;
        this.endCursor = endCursor;
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
    first: number;
    after: string;
    constructor(limit: number, after: string) {
        this.first = limit;
        this.after = after;
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

export async function resolveCollection<T>(
        args: FindAllArgs,
        fetchData: (cursor: Cursor) => Promise<FindAllResult<T>>):
    Promise<ResponseConnection<ResponseEdge<T>>> {
    try {
        let offset = 0;
        if (args.after && args.after !== '') {
            let cursorDecoded = decodeCursor(args.after);
            args.first = cursorDecoded.limit;
            offset = cursorDecoded.offset;
        }
        args.first = args.first ? args.first : 10;
        const cursor = new Cursor(args.first, offset);

        let result: FindAllResult<T> = await fetchData(cursor);

        let hasNextPage = false;
        if (result.rows.length > args.first) {
            hasNextPage = true;
            result.rows = result.rows.slice(0, args.first);
        }
        const edges: ResponseEdge<T>[] = [];
        for (let i = 0; i < result.rows.length; i++) {
            let cursor = { limit: args.first, offset: offset + args.first + i };
            edges.push(new ResponseEdge<T>(result.rows[i], encodeCursor(cursor)));
        }
        const hasPreviousPage = false; // TODO: support backwards paging
        return new ResponseConnection<ResponseEdge<T>>(edges, new PageInfo(
            hasNextPage,
            hasPreviousPage,
            edges[0].cursor,
            edges[edges.length - 1].cursor
        ));
    } catch (e) {
        throw e;
    }
}