/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from "react";

export type DateTimeProps = {
    when: Date,
}

// for use on EntriesView page, e.g. "4 days ago"
export function RelativeDateTime(props: DateTimeProps) {
    const updated = new Date(props.when).getTime();
    const span = Date.now() - updated;
    const rtf = new Intl.RelativeTimeFormat('en-US', { style: 'long', numeric: 'auto' });
    const daysAgo = -1 * Math.round(span / (24 * 60 * 60 * 1000));
    const hoursAgo = -1 * Math.round(span / (60 * 60 * 1000));
    const minutesAgo = -1 * Math.round(span / (60 * 1000));
    const secondsAgo = -1 * Math.round(span / (1000));
    if (daysAgo < 0) {
        return <>{rtf.format(daysAgo, 'day')}</>;
    } else if (hoursAgo < 0) {
        return <>{rtf.format(hoursAgo, 'hour')}</>
    } else if (minutesAgo < 0) {
        return <>{rtf.format(minutesAgo, 'minute')}</>;
    } else {
        return <>{rtf.format(secondsAgo, 'second')}</>;
    }

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