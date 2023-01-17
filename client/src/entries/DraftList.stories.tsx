/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BrowserRouter as Router} from 'react-router-dom';
import {client} from "../setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import DraftList from "./DraftList";
import {entriesData} from "../mocks/handlers";
import {Routes, Route} from "react-router";

export default {
    title: 'DraftList',
    component: DraftList,
} as ComponentMeta<typeof DraftList>;

export const Primary: ComponentStory<typeof DraftList> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={<DraftList drafts={entriesData} handle='daves' />} />
            </Routes>
        </Router>
    </ApolloProvider>

