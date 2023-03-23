/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from '@storybook/react';
import {EntryView} from "./EntryView";
import {TestHarness} from "../tests/TestHarness";
import {Route} from "react-router";
import { withRouter } from 'storybook-addon-react-router-v6';

export default {
    title: 'EntryView',
    component: EntryView,
    decorators: [withRouter],
    parameters: {
        reactRouter: {
            routePath: '/blogs/:handle/entries/:id',
            routeParams: { id: 'dummy', handle: 'daves' },
        }
    }
} as ComponentMeta<typeof EntryView>;

export const Primary: ComponentStory<typeof EntryView> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*' element={<EntryView />} />
    </TestHarness>

export const LoggedOut: ComponentStory<typeof EntryView> = () =>
    <TestHarness loggedIn={false}>
        <Route path='*' element={<EntryView />} />
    </TestHarness>

