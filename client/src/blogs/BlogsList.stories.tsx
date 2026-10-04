/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BlogsList} from "./BlogsList";
import {BrowserRouter as Router} from 'react-router-dom';
import {ApolloProvider} from '@apollo/client';
import {ComponentMeta, ComponentStory} from "@storybook/react";
import {Route, Routes} from "react-router";
import {client} from '../setupTests';

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
