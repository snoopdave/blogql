/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BlogList} from "./BlogList";
import {BrowserRouter as Router} from 'react-router-dom';
import {client} from "../setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Routes, Route} from "react-router";

export default {
    title: 'BlogList',
    component: BlogList,
} as ComponentMeta<typeof BlogList>;

export const Primary: ComponentStory<typeof BlogList> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={<BlogList />} />
            </Routes>
        </Router>
    </ApolloProvider>;

