/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BlogsList} from "./BlogsList";
import {BrowserRouter as Router} from 'react-router-dom';
import {client} from "../setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Routes, Route} from "react-router";

export default {
    title: 'BlogList',
    component: BlogsList,
} as ComponentMeta<typeof BlogsList>;

export const Primary: ComponentStory<typeof BlogsList> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={<BlogsList />} />
            </Routes>
        </Router>
    </ApolloProvider>;

