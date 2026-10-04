/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BlogsList} from "./BlogsList";
import {BrowserRouter as Router} from 'react-router-dom';
import {MockedProvider, MockedResponse} from "@apollo/client/testing";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Route, Routes} from "react-router";

export default {
    title: 'BlogList',
    component: BlogsList,
} as ComponentMeta<typeof BlogsList>;

let mocks: readonly MockedResponse<any, any>[] | undefined;
export const Primary: ComponentStory<typeof BlogsList> = () =>
    <MockedProvider mocks={mocks} addTypename={false}>
        <Router>
            <Routes>
                <Route path='*' element={<BlogsList />} />
            </Routes>
        </Router>
    </MockedProvider>;
