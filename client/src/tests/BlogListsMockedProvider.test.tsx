import '@testing-library/jest-dom'
import '@testing-library/react';
import {BlogList} from '../BlogList';
import {Route, BrowserRouter as Router} from 'react-router-dom';
import {screen, render} from '@testing-library/react';

import {MockedProvider} from '@apollo/client/testing';
import {BLOGS_QUERY} from '../graphql/queries';

it('BlogList renders without error with Apollo MockedProvider', async () => {
    const now = new Date();
    const blogsMock = [{
        request: {
            query: BLOGS_QUERY,
        },
        result: {
            data: {
                blogs: {
                    nodes: [{
                        id: 'dummy1',
                        name: 'Blog One',
                        handle: 'blog1',
                        created: now,
                        updated: now,
                        user: {
                            id: 'user1',
                            username:'user1'
                        }
                    }, {
                        id: 'dummy2',
                        name: 'Blog Two',
                        handle: 'blog2',
                        created: now,
                        updated: now,
                        user: {
                            id: 'user2',
                            username:'user2'
                        }
                    }]
                }
            }
        },
    }];
    const render1 = render(
        <MockedProvider mocks={blogsMock} addTypename={false}>
            <Router>
                <Route path='/'>
                    <BlogList />
                </Route>
            </Router>
        </MockedProvider>
    );
    screen.debug();
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    screen.debug();
    expect(await screen.findByText('Blog One')).toBeInTheDocument();
    screen.debug();
    expect(await screen.findByText('Blog Two')).toBeInTheDocument();
});
