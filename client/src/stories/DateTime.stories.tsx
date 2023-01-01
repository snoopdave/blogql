
import {ComponentStory} from '@storybook/react';
import {RelativeDateTime} from "../DateTime";

export default {
    title: 'DateTime',
    component: RelativeDateTime,
}

const now = new Date();
const Template: ComponentStory<typeof RelativeDateTime> = () => <RelativeDateTime
   when={now}
/>

export const Default = Template.bind({});