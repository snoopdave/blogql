/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloClient, ApolloProvider, InMemoryCache} from '@apollo/client';
import App from './App';
import * as serviceWorker from './tests/serviceWorker';
import {GoogleOAuthProvider} from "@react-oauth/google";
import {GOOGLE_SIGNON_CID} from "./googlecid";

console.log('BlogQL starting');

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache(),
    credentials: 'include',
    name: 'blogql-web',
    version: '1.0',
    defaultOptions: {
        watchQuery: {
            nextFetchPolicy: 'network-only',
        },
    },
});

ReactDOM.render(
    <GoogleOAuthProvider clientId={GOOGLE_SIGNON_CID}>
        <ApolloProvider client={client}>
           <App />
        </ApolloProvider>
    </GoogleOAuthProvider>,
    document.getElementById('app')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
