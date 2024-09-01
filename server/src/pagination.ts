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
    cursor: string;
    constructor(node: T, cursor: string) {
        this.node = node;
        this.cursor = cursor;
    }
}

export class PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    totalCount: number;
    constructor(
            hasNextPage: boolean,
            hasPreviousPage: boolean,
            startCursor: string | null,
            endCursor: string | null,
            totalCount: number) {
        this.hasNextPage = hasNextPage;
        this.hasPreviousPage = hasPreviousPage;
        this.startCursor = startCursor;
        this.endCursor = endCursor;
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
    encode(): string {
        const cursorJson  = JSON.stringify(this);
        return Buffer.from(cursorJson, 'binary').toString('base64');
    }
}

export function decodeCursor(cursor: string): Cursor {
    const cursorJson = Buffer.from(cursor, `base64`).toString(`binary`);
    return JSON.parse(cursorJson);
}

export class FindAllArgs {
    first?: number;
    after?: string;
    last?: number;
    before?: string;
}

export class FindAllResult<T> {
    rows?: T[];
    count?: number;
    totalCount?: number;
}

function log(msg: string) {
    appendFileSync('/tmp/jest.log.txt', msg + '\n', {'encoding': 'utf8'});
}

export async function resolveCollection<T>(
    args: FindAllArgs,
    fetchData: (cursor: Cursor) => Promise<FindAllResult<T>>
): Promise<ResponseConnection<ResponseEdge<T>>> {
    try {
        let limit = 10;
        let offset = 0;

         if (args.after && args.after !== '') {
            const cursorDecoded = decodeCursor(args.after);
            limit = args.first ? args.first : cursorDecoded.limit;
            offset = cursorDecoded.offset + 1;

        } else if (args.before && args.before !== '') {
            const cursorDecoded = decodeCursor(args.before);
            limit = args.last ? args.last : cursorDecoded.limit;
            offset = cursorDecoded.offset - limit;

        } else {
            limit = args.first ? args.first : limit;
        }

        // ask for one more than we need to see if there is a next page
        const result: FindAllResult<T> = await fetchData(new Cursor(limit + 1, offset));

        const hasNextPage = result.rows!.length > limit;
        const hasPreviousPage = offset > 0;

        const edges: ResponseEdge<T>[] = result.rows!.slice(0, limit).map((row, index) => {
            const rowCursor: Cursor = new Cursor(limit, offset + index);
            return new ResponseEdge<T>(row, rowCursor.encode());
        });

        const startCursor = edges.length > 0 ? edges[0].cursor : null;
        const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

        return new ResponseConnection<ResponseEdge<T>>(edges, new PageInfo(
            hasNextPage,
            hasPreviousPage,
            startCursor,
            endCursor,
            result.count!
        ));
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Failed to resolve collection: ${error.message}`);
        } else {
            throw new Error('Failed to resolve collection: An unknown error occurred');
        }
    }
}