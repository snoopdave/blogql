/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BrowserRouter as Router} from 'react-router-dom';
import {Routes, Route} from "react-router";
import {client} from "../setupTests";
import {ApolloProvider} from "@apollo/client";
import {ComponentMeta, ComponentStory} from "@storybook/react";
import EntryCard from "./EntryCard";

export default {
    title: 'EntryCard',
    component: EntryCard,
} as ComponentMeta<typeof EntryCard>;

export const Primary: ComponentStory<typeof EntryCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={
                    <EntryCard
                        loggedIn={false}
                        handle='daves'
                        entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                        title='Feline Grace'
                        content='Silent paws tread, Elegant feline form glides, My heart skips a beat.'
                        updated={new Date('2022-12-08T12:23:36.697Z')}
                    />} />
            </Routes>
        </Router>
    </ApolloProvider>

export const LoggedIn: ComponentStory<typeof EntryCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={
                    <EntryCard
                        loggedIn={true}
                        handle='daves'
                        entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                        title='Feline Grace'
                        content='Silent paws tread, Elegant feline form glides, My heart skips a beat.'
                        updated={new Date('2023-01-08T12:23:36.697Z')}
                    />} />
            </Routes>
        </Router>
    </ApolloProvider>

export const ExcessTitleContent : ComponentStory<typeof EntryCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={
                    <EntryCard
                        loggedIn={false}
                        handle='daves'
                        entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                        title='Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace Feline Grace'
                        content='Silent paws tread, Elegant feline form glides, My heart skips a beat.'
                        updated={new Date('2022-07-08T12:23:36.697Z')}
                    />} />
            </Routes>
        </Router>
    </ApolloProvider>

export const ExcessContent : ComponentStory<typeof EntryCard> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={
                    <EntryCard
                        loggedIn={false}
                        handle='daves'
                        entryId='29e9b074-0727-4ee4-ba6a-e4efdcaacaf1-entry'
                        title='Feline Grace'
                        content='Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. Silent paws tread, Elegant feline form glides, My heart skips a beat. '
                        updated={new Date('2022-07-08T12:23:36.697Z')}
                    />} />
            </Routes>
        </Router>
    </ApolloProvider>
