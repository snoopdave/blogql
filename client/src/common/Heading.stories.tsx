/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Heading} from "./Heading";

export default {
    title: 'Heading',
    component: Heading,
} as ComponentMeta<typeof Heading>;

export const Primary: ComponentStory<typeof Heading> = () =>
    <Heading title='Short title' heading='Short heading' />

export const MediumContent: ComponentStory<typeof Heading> = () =>
    <Heading title='This title is a little longer than a title really should be'
             heading='This heading is a doozy as well, maybe just a little to long for a component of this size and shape you know. Who knows?' />

export const LongerContent: ComponentStory<typeof Heading> = () =>
    <Heading title='This title is a little longer than a title really should be and then this title is a little longer than a title really should be'
             heading='This heading is a doozy as well, maybe just a little to long for a component of this size and shape you know. Who knows? This heading is a doozy as well, maybe just a little to long for a component of this size and shape you know. Who knows? This heading is a doozy as well, maybe just a little to long for a component of this size and shape you know. Who knows?' />

