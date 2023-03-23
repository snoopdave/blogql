/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from '@storybook/react';
import {EditorFormViaEntryId} from "./EntryEditor";
import {TestHarness} from "../tests/TestHarness";
import {Route} from "react-router";
import { withRouter } from 'storybook-addon-react-router-v6';

export default {
    title: 'EntryEditor',
    component: EditorFormViaEntryId,
    decorators: [withRouter],
    parameters: {
        reactRouter: {
            routePath: '/blogs/:handle/entries/:id',
            routeParams: { id: 'dummy', handle: 'daves' },
        }
    }
} as ComponentMeta<typeof EditorFormViaEntryId>;

export const Primary: ComponentStory<typeof EditorFormViaEntryId> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*' element={<EditorFormViaEntryId />} />
    </TestHarness>


