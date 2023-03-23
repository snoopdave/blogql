/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from '@storybook/react';
import {Route} from 'react-router';
import Entries from "./Entries";
import {TestHarness} from "../tests/TestHarness";
import {withRouter} from "storybook-addon-react-router-v6";

export default {
    title: 'Entries',
    component: Entries,
    decorators: [withRouter],
    parameters: {
        reactRouter: {
            routePath: '/blogs/:handle/entries/:id',
            routeParams: { id: 'dummy', handle: 'daves' },
        }
    }
} as ComponentMeta<typeof Entries>;

export const Primary: ComponentStory<typeof Entries> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*' element={<Entries />} />
    </TestHarness>

export const LoggedOut: ComponentStory<typeof Entries> = () =>
    <TestHarness loggedIn={false}>
        <Route path='*' element={<Entries />} />
    </TestHarness>



