/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/react';
import {BlogList} from '../BlogList';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import {screen, render} from '@testing-library/react';

import {ApolloProvider} from '@apollo/client';
import {client} from '../setupTests';

it('BlogList renders without error with Mocked Service Worker', async () => {
    const render1 = render(
        <ApolloProvider client={client}>
            <Router>
                <Route path='/'>
                    <BlogList />
                </Route>
            </Router>
        </ApolloProvider>
    );
    expect(await screen.findByText('Blog One')).toBeInTheDocument();
    expect(await screen.findByText('Dave\s Blog')).toBeInTheDocument();
});