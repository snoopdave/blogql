/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from '@storybook/react';
import {Route} from 'react-router';
import Drafts from "./Drafts";
import {TestHarness} from "../tests/TestHarness";
import {withRouter} from "storybook-addon-react-router-v6";

export default {
    title: 'Drafts',
    component: Drafts,
    decorators: [withRouter],
    parameters: {
        reactRouter: {
            routePath: '/blogs/:handle/entries/:id',
            routeParams: { id: 'dummy', handle: 'daves' },
        }
    }
} as ComponentMeta<typeof Drafts>;

export const Primary: ComponentStory<typeof Drafts> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*' element={<Drafts />} />
    </TestHarness>

