/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {BrowserRouter as Router} from 'react-router-dom';
import {client} from '../setupTests';
import {ApolloProvider} from '@apollo/client';
import {ComponentMeta, ComponentStory} from '@storybook/react';
import DraftsList from './DraftsList';
import {entriesData} from '../mocks/handlers';
import {Routes, Route} from 'react-router';

export default {
    title: 'DraftsList',
    component: DraftsList,
} as ComponentMeta<typeof DraftsList>;

export const Primary: ComponentStory<typeof DraftsList> = () =>
    <ApolloProvider client={client}>
        <Router>
            <Routes>
                <Route path='*' element={<DraftsList drafts={entriesData} handle='daves' />} />
            </Routes>
        </Router>
    </ApolloProvider>

