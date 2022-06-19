/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from "react";

export type DateTimeProps = {
    updated: Date,
}

export function DateTime(props: DateTimeProps) {
    let updated = new Date(props.updated).getTime();
    let span = Date.now() - updated;
    let daysAgo = -1 * Math.round(span / (24 * 60 * 60 * 1000));
    //console.log(`Updated = ${updated} span = ${span} daysAgo = ${daysAgo}`);
    let rtf = new Intl.RelativeTimeFormat('en-US', { style: 'long', numeric: 'auto' });
    return <span>{rtf.format(daysAgo, 'day')}</span>;
}