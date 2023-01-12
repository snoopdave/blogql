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
import BlogColumns from "./BlogColumns";

export default {
    title: 'BlogColumns',
    component: BlogColumns,
} as ComponentMeta<typeof BlogColumns>;

export const Primary: ComponentStory<typeof BlogColumns> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='*'>
                <BlogColumns entries={entriesData} handle='daves' loggedIn={false} />
            </Route>
        </Router>
    </ApolloProvider>

export const LoggedIn: ComponentStory<typeof BlogColumns> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='*'>
                <BlogColumns entries={entriesData} handle='daves' loggedIn={true} />
            </Route>
        </Router>
    </ApolloProvider>
