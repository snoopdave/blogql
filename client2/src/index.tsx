/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import {checkLoginStatus} from './Authentication';
import {ApolloClient, ApolloProvider, InMemoryCache} from '@apollo/client';
//import {createRoot} from "react-dom/client";

console.log('BlogQL starting');

checkLoginStatus( user => {
    if (user) {
        localStorage.setItem('BlogQlUser', JSON.stringify(user));
    }
});

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache(),
    credentials: 'include',
    name: 'blogql-web',
    version: '1.0'
});

ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('app')
);

// React 18
// const container = document.getElementById('app');
// const root = createRoot(container!);
// root.render(
//     <React.StrictMode>
//         <ApolloProvider client={client}>
//             <App />
//         </ApolloProvider>
//     </React.StrictMode>
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
