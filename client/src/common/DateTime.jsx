"use strict";
/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleDateTime = exports.RelativeDateTime = void 0;
var react_1 = require("react");
// for use on Entries page, e.g. "4 days ago"
function RelativeDateTime(props) {
    var updated = new Date(props.when).getTime();
    var span = Date.now() - updated;
    var rtf = new Intl.RelativeTimeFormat('en-US', { style: 'long', numeric: 'auto' });
    var daysAgo = -1 * Math.round(span / (24 * 60 * 60 * 1000));
    var hoursAgo = -1 * Math.round(span / (60 * 60 * 1000));
    var minutesAgo = -1 * Math.round(span / (60 * 1000));
    var secondsAgo = -1 * Math.round(span / (1000));
    if (daysAgo < 0) {
        return <>{rtf.format(daysAgo, 'day')}</>;
    }
    else if (hoursAgo < 0) {
        return <>{rtf.format(hoursAgo, 'hour')}</>;
    }
    else if (minutesAgo < 0) {
        return <>{rtf.format(minutesAgo, 'minute')}</>;
    }
    else {
        return <>{rtf.format(secondsAgo, 'second')}</>;
    }
}
exports.RelativeDateTime = RelativeDateTime;
// for use in editor and drafts page, e.g. "Sunday, July 3, 2022, 10:34 AM"
function SimpleDateTime(props) {
    return <>{new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        })
            .format(new Date(props.when))}
        </>;
}
exports.SimpleDateTime = SimpleDateTime;
