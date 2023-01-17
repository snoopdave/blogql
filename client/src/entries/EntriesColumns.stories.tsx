/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BrowserRouter as Router} from 'react-router-dom';
import {client} from "../setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import {entriesData} from "../mocks/handlers";
import EntriesColumns from "./EntriesColumns";
import {Routes, Route} from "react-router";

export default {
    title: 'EntriesColumns',
    component: EntriesColumns,
} as ComponentMeta<typeof EntriesColumns>;

export const Primary: ComponentStory<typeof EntriesColumns> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={
                    <EntriesColumns entries={entriesData} handle='daves' loggedIn={false} />} />
            </Routes>
        </Router>
    </ApolloProvider>

export const LoggedIn: ComponentStory<typeof EntriesColumns> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={
                    <EntriesColumns entries={entriesData} handle='daves' loggedIn={true} />} />
            </Routes>
        </Router>
    </ApolloProvider>
