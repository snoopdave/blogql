/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BrowserRouter as Router, Route} from 'react-router-dom';
import {client} from "./setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import BlogCard from "./BlogCard";

export default {
    title: 'BlogCard',
    component: BlogCard,
} as ComponentMeta<typeof BlogCard>;

export const Primary: ComponentStory<typeof BlogCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='*'>
                <BlogCard
                    loggedIn={false}
                    handle='daves'
                    entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                    title='Feline Grace'
                    content='Silent paws tread, Elegant feline form glides, My heart skips a beat.'
                    updated={new Date('2022-12-08T12:23:36.697Z')}
                />
            </Route>
        </Router>
    </ApolloProvider>

export const LoggedIn: ComponentStory<typeof BlogCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='*'>
                <BlogCard
                    loggedIn={true}
                    handle='daves'
                    entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                    title='Feline Grace'
                    content='Silent paws tread, Elegant feline form glides, My heart skips a beat.'
                    updated={new Date('2023-01-08T12:23:36.697Z')}
                />
            </Route>
        </Router>
    </ApolloProvider>

export const ExcessTitleContent : ComponentStory<typeof BlogCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='*'>
                <BlogCard
                    loggedIn={false}
                    handle='daves'
                    entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                    title='Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace'
                    content='Silent paws tread, Elegant feline form glides, My heart skips a beat.'
                    updated={new Date('2022-07-08T12:23:36.697Z')}
                />
            </Route>
        </Router>
    </ApolloProvider>

export const ExcessContent : ComponentStory<typeof BlogCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Route exact path='*'>
                <BlogCard
                    loggedIn={false}
                    handle='daves'
                    entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                    title='Feline Grace'
                    content='Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. '
                    updated={new Date('2022-07-08T12:23:36.697Z')}
                />
            </Route>
        </Router>
    </ApolloProvider>



