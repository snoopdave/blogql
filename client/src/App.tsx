/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useState} from 'react';
import {Route, Routes} from 'react-router';
import {BrowserRouter as Router} from 'react-router-dom';
import {Layout} from "antd";

import {EditorFormViaBlogHandle, EditorFormViaEntryId} from './entries/EntryEditor';
import Entries from './entries/Entries';
import Drafts from './entries/Drafts';
import {logout, ProvideAuth, User} from './common/Authentication';
import {BlogsList} from './blogs/BlogsList';
import {BlogCreate} from './blogs/BlogCreate';
import {BlogSettings} from './blogs/BlogSettings';
import {Welcome} from './Welcome';
import {BlogNav} from './BlogNav';
import {EntryView} from './entries/EntryView';

// import BlogQL CSS last to ensure it appears at the end of bundle.css
import 'antd/dist/reset.css';
import './App.css';

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

    const headerStyle: React.CSSProperties = {
    };

    const contentStyle: React.CSSProperties = {
        padding: 0,
        margin: '2em 5em 2em 5em'
    };

    const footerStyle: React.CSSProperties = {
        padding: 0,
        margin: '2em 5em 2em 5em'
    };

    const { Header, Footer, Content } = Layout;

    return (
        <ProvideAuth onLogin={onLogin}>
            <Router>

                <Layout>
                    <Header style={headerStyle}>
                        <BlogNav onLogout={onLogout} />
                    </Header>
                    <Content style={contentStyle}>
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
                    </Content>
                    <Footer style={footerStyle}>BlogQL Copyright Dave Johnson 2023</Footer>
                </Layout>

            </Router>
        </ProvideAuth>
    );
}

export default App;
