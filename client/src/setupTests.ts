// src/setupTests.js
import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';
import { server } from './mocks/server.js'
import fetch from 'cross-fetch';

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    credentials: 'include',
    name: 'blogql-web',
    version: '1.0',
    link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch })
});

// Establish API mocking before all tests.
beforeAll(() => server.listen())

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished.
afterAll(() => server.close())
