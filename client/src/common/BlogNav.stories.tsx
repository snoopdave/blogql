/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from '@storybook/react';
import {Route} from 'react-router';
import {BlogNav} from "./BlogNav";
import {TestHarness} from "../tests/TestHarness";
import {withRouter} from "storybook-addon-react-router-v6";
import {Blog} from "../gql/graphql";

export default {
    title: 'BlogNav',
    component: BlogNav,
    decorators: [withRouter],
    parameters: {
        reactRouter: {
            routePath: '/blogs',
        }
    }
} as ComponentMeta<typeof BlogNav>;

function onUpdate(blog: Blog | null) {
    console.log('Blog updated');
}

export const Primary: ComponentStory<typeof BlogNav> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*' element={<BlogNav onBlogUpdated={onUpdate} />} />
    </TestHarness>

export const LoggedOut: ComponentStory<typeof BlogNav> = () =>
    <TestHarness loggedIn={false}>
        <Route path='*' element={<BlogNav onBlogUpdated={onUpdate} />} />
    </TestHarness>

export const LoggedInNoBlog: ComponentStory<typeof BlogNav> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*' element={<BlogNav onBlogUpdated={onUpdate} />} />
    </TestHarness>

