
import {ComponentStory} from '@storybook/react';
import {RelativeDateTime} from "./DateTime";
import DraftList from "../entries/DraftList";


export default {
    title: 'DateTime',
    component: RelativeDateTime,
}

const now = new Date();
export const Primary: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={now} />

let threeWeeksAgo = new Date();
threeWeeksAgo.setTime(threeWeeksAgo.getTime() - (3 * 7 * 24 * 60 * 60 * 1000));
export const WeeksAgo: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={threeWeeksAgo} />

let threeMonthsAgo = new Date();
threeMonthsAgo.setTime(threeMonthsAgo.getTime() - (3 * 4 * 7 * 24 * 60 * 60 * 1000));
export const MonthsAgo: ComponentStory<typeof RelativeDateTime> = () =>
    <RelativeDateTime when={threeMonthsAgo} />


