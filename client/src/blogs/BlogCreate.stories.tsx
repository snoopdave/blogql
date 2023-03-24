/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Route} from "react-router";
import {BlogCreate} from "./BlogCreate";
import {TestHarness} from "../tests/TestHarness";
import {withRouter} from "storybook-addon-react-router-v6";
import {Blog, User} from "../graphql/schema";

export default {
    title: 'BlogCreate',
    component: BlogCreate,
    decorators: [withRouter],
    parameters: {
        reactRouter: {
            routePath: '/create-blog',
        }
    }
} as ComponentMeta<typeof BlogCreate>;

function onUpdate(blog: Blog | null) {
    console.log('Blog updated');
}

export const Primary: ComponentStory<typeof BlogCreate> = () =>
    <TestHarness loggedIn={true}>
        <Route path='*' element={<BlogCreate onBlogUpdated={onUpdate}/>} />
    </TestHarness>

