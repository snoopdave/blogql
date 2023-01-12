/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BrowserRouter as Router, Route} from 'react-router-dom';
import {client} from "./setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import DraftList from "./DraftList";
import {entriesData} from "./mocks/handlers";

export default {
    title: 'DraftList',
    component: DraftList,
} as ComponentMeta<typeof DraftList>;

export const Primary: ComponentStory<typeof DraftList> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='*'>
                <DraftList drafts={entriesData} handle='daves' />
            </Route>
        </Router>
    </ApolloProvider>

