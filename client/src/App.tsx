/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import {Routes, Route} from 'react-router';
import {BrowserRouter as Router} from 'react-router-dom';

import {Col, Row} from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

import {EditorFormViaBlogHandle, EditorFormViaEntryId} from './entries/EntryEditor';
import Entries from './entries/Entries';
import Drafts from './entries/Drafts';
import {logout, ProvideAuth, User} from './common/Authentication';
import {BlogsList} from './blogs/BlogsList';
import {BlogCreate} from './blogs/BlogCreate';
import {BlogSettings} from './blogs/BlogSettings';
import {Welcome} from './Welcome';

// import BlogQL CSS last to ensure it appears at the end of bundle.css
import './App.css';
import {BlogNav} from './BlogNav';
import {EntryView} from './entries/EntryView';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    const onLogin = (user: User | null | undefined) => {
        if (user) {
            setLoggedIn(true);
            localStorage.setItem('BlogQlUser', JSON.stringify(user));
            console.log(`User ${user.email} (${user.id}) logged in`);
            return;
        }
        throw new Error('Login failed');
    };

    const onLogout = () => {
        logout(() => {
            setLoggedIn(false);
        });
    };

    const onBlogUpdated = (hasBlog: boolean) => {
        // no-op
    }

    return (
        <Container>
            <ProvideAuth onLogin={onLogin}>
                <Router>

                    <Row>
                        <Col/>
                        <Col xs={10}>
                            <BlogNav onLogout={onLogout} />
                        </Col>
                        <Col/>
                    </Row>

                    <Row>
                        <Col/>
                        <Col xs={10}>

                            <Routes>
                                <Route path='/'
                                       element={<BlogsList/>} />

                                <Route path='/login'
                                       element={<Welcome onLogin={onLogin}/>} />

                                <Route path='/create-blog'
                                       element={<BlogCreate onBlogUpdated={onBlogUpdated}/>} />

                                <Route path='/blogs'
                                       element={<BlogsList/>} />

                                <Route path='/blogs/:handle'
                                       element={<Entries loggedIn={loggedIn}/>} />

                                <Route path='/blogs/:handle/settings'
                                       element={<BlogSettings onBlogUpdated={onBlogUpdated}/>} />

                                <Route path='/blogs/:handle/drafts'
                                       element={<Drafts/>} />

                                <Route path='/blogs/:handle/edit'
                                       element={<EditorFormViaBlogHandle/>} />

                                <Route path='/blogs/:handle/edit/:id'
                                       element={<EditorFormViaEntryId/>} />

                                <Route path='/blogs/:handle/entries/:id'
                                       element={<EntryView loggedIn={loggedIn}/>} />
                            </Routes>

                        </Col>
                        <Col/>
                    </Row>
                </Router>

            </ProvideAuth>
        </Container>
    );
}

export default App;
