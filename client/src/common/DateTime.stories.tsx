/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentStory} from '@storybook/react';
import {
    MILLISECONDS_IN_AN_HOUR,
    MILLISECONDS_IN_A_MINUTE,
    MILLISECONDS_IN_A_DAY,
    MILLISECONDS_IN_A_WEEK,
    MILLISECONDS_IN_A_MONTH,
    RelativeDateTime}
    from "./DateTime";


export default {
    title: 'DateTime',
    component: RelativeDateTime,
}

const now = new Date();
export const Primary: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={now} />

let twentyMinutesAgo = new Date();
twentyMinutesAgo.setTime(twentyMinutesAgo.getTime() - 20 * MILLISECONDS_IN_A_MINUTE);
export const MinutesAgo: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={twentyMinutesAgo} />

let fourHoursAgo = new Date();
fourHoursAgo.setTime(fourHoursAgo.getTime() - 4 * MILLISECONDS_IN_AN_HOUR);
export const FourHoursAgo: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={fourHoursAgo} />

let fiveDaysAgo = new Date();
fiveDaysAgo.setTime(fiveDaysAgo.getTime() - 5 * MILLISECONDS_IN_A_DAY);
export const DaysAgo: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={fiveDaysAgo} />

let threeWeeksAgo = new Date();
threeWeeksAgo.setTime(threeWeeksAgo.getTime() - 3 * MILLISECONDS_IN_A_WEEK);
export const WeeksAgo: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={threeWeeksAgo} />

let threeMonthsAgo = new Date();
threeMonthsAgo.setTime(threeMonthsAgo.getTime() - 3 * MILLISECONDS_IN_A_MONTH);
export const MonthsAgo: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={threeMonthsAgo} />



