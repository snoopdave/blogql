/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Route} from "react-router";
import {BlogSettings, BlogSettingsById} from "./BlogSettings";
import {TestHarness} from "../tests/TestHarness";
import {withRouter} from "storybook-addon-react-router-v6";
import {Blog} from "../gql/graphql";

export default {
    title: 'BlogSettings',
    component: BlogSettings,
    decorators: [withRouter],
    parameters: {
        reactRouter: {
            routePath: '/blogs/:handle/settings',
            routeParams: { id: 'dummy', handle: 'daves' },
        }
    }
} as ComponentMeta<typeof BlogSettings>;

function onUpdate(blog: Blog | null) {
    console.log('Blog updated');
}

export const Primary: ComponentStory<typeof BlogSettings> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*'
           element={<BlogSettingsById onBlogUpdated={onUpdate} id='dummyid' name='Daves blog' />} />
    </TestHarness>

