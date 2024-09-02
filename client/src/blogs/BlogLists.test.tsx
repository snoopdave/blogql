/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import '@testing-library/jest-dom';
import '@testing-library/react';
import {BlogsList} from './BlogsList';
import {BrowserRouter as Router} from 'react-router-dom';
import {screen} from '@testing-library/react';
import {Route, Routes} from "react-router";
import './MatchMediaMock';
import {act} from 'react';
import {createRoot} from "react-dom/client"; // Import act from react

it('BlogsList renders without error with Mocked Service Worker', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
        root.render(
            <MockedProvider mocks={mocks} addTypename={false}>
                <Router>
                    <Routes>
                        <Route path="/" element={<BlogsList />} />
                    </Routes>
                </Router>
            </MockedProvider>
        );
    });
    expect(await screen.findByText('Blog Title 0')).toBeInTheDocument();
    expect(await screen.findByText('Blog Title 1')).toBeInTheDocument();
});
