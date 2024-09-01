/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import {useMemo} from "react";

export type DateTimeProps = {
    when: Date,
}

export const MILLISECONDS_IN_A_SECOND = 1000;
export const MILLISECONDS_IN_A_MINUTE = 60 * MILLISECONDS_IN_A_SECOND;
export const MILLISECONDS_IN_AN_HOUR = 60 * MILLISECONDS_IN_A_MINUTE;
export const MILLISECONDS_IN_A_DAY= 24 * MILLISECONDS_IN_AN_HOUR;
export const MILLISECONDS_IN_A_WEEK = 7 * MILLISECONDS_IN_A_DAY;
export const MILLISECONDS_IN_A_MONTH = 30 * MILLISECONDS_IN_A_WEEK;

type TimeUnit = 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

// for use on Entries page, e.g. "4 days ago"
export function RelativeDateTime(props: DateTimeProps) {
    const date = new Date(props.when); // Convert to Date object
    const updated = date.getTime();
    const span = Date.now() - updated;

    const rtf = useMemo(() => new Intl.RelativeTimeFormat('en-US', { style: 'long', numeric: 'auto' }), []);

    const timeUnits: { unit: TimeUnit, value: number }[] = [
        { unit: 'month', value: MILLISECONDS_IN_A_MONTH },
        { unit: 'week', value: MILLISECONDS_IN_A_WEEK },
        { unit: 'day', value: MILLISECONDS_IN_A_DAY },
        { unit: 'hour', value: MILLISECONDS_IN_AN_HOUR },
        { unit: 'minute', value: MILLISECONDS_IN_A_MINUTE },
        { unit: 'second', value: MILLISECONDS_IN_A_SECOND },
    ];

    for (const { unit, value } of timeUnits) {
        const timeAgo = -1 * Math.round(span / value);
        if (Math.abs(timeAgo) > 0) {
            return <>{rtf.format(timeAgo, unit)}</>;
        }
    }

    return <>Just now</>;
}

// for use in editor and drafts page, e.g. "Sunday, July 3, 2022, 10:34 AM"
export function SimpleDateTime(props: DateTimeProps) {
    return <>{new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour:'numeric',
        minute:'numeric' })
        .format(new Date(props.when))}
        </>;
}