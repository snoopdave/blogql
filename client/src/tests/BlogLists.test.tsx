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
    screen.debug();
    //expect(await screen.findByText('Loading...')).toBeInTheDocument();
    //screen.debug();
    expect(await screen.findByText('Blog One')).toBeInTheDocument();
    screen.debug();
    expect(await screen.findByText('Blog Two')).toBeInTheDocument();
});