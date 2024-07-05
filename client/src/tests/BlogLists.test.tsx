import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */
import '@testing-library/jest-dom';
import '@testing-library/react';
import { BlogsList } from '../blogs/BlogsList';
import { BrowserRouter as Router } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { Routes, Route } from "react-router";
import { ApolloProvider } from '@apollo/client';
import { client } from '../setupTests';
import './MatchMediaMock';
import { act } from 'react';
import {createRoot} from "react-dom/client"; // Import act from react

it('BlogsList renders without error with Mocked Service Worker', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
        root.render(
            <ApolloProvider client={client}>
                <Router>
                    <Routes>
                        <Route path="/" element={<BlogsList />} />
                    </Routes>
                </Router>
            </ApolloProvider>
        );
    });

    expect(await screen.findByText('Blog 1')).toBeInTheDocument();
    expect(await screen.findByText('Blog 2')).toBeInTheDocument();
});
