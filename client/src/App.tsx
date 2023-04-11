/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useEffect, useState} from 'react';
import {Route, Routes} from 'react-router';
import {BrowserRouter as Router} from 'react-router-dom';
import {Divider, Layout} from "antd";

import {EditorFormViaBlogHandle, EditorFormViaEntryId} from './entries/EntryEditor';
import Entries from './entries/Entries';
import Drafts from './entries/Drafts';
import {logout, ProvideAuth} from './common/Authentication';
import {BlogsList} from './blogs/BlogsList';
import {BlogCreate} from './blogs/BlogCreate';
import {BlogSettings} from './blogs/BlogSettings';
import {Welcome} from './Welcome';
import {BlogNav} from './BlogNav';
import {EntryView} from './entries/EntryView';

// import BlogQL CSS last to ensure it appears at the end of bundle.css
import 'antd/dist/reset.css';
import './App.css';
import {Blog, User} from "./gql/graphql";

export interface BlogRef {
    name: string,
    handle: string,
}

function App() {
    const [user, setUser] = useState<User | null>();
    const [blog, setBlog] = useState<BlogRef | null>();

    useEffect(() => {
        console.log(`Blog: ${blog?.handle}`);
    });

    const onLogin = (user: User | null | undefined) => {
        if (user) {
            setUser(user);
            console.log(`User ${user.email} (${user.id}) logged in`);
            return;
        }
        throw new Error('Login failed');
    };

    const onLogout = () => {
        logout((message) => {
            console.log(`Logout message: ${message}`);
            setUser(null);
        });
    };

    const onBlogUpdated = (updatedBlog: BlogRef | null) => {
        setBlog(updatedBlog);
    }

    const headerStyle: React.CSSProperties = {
    };

    const contentStyle: React.CSSProperties = {
        padding: 0,
        margin: '3em 5em 3em 5em', // trbl
    };

    const footerStyle: React.CSSProperties = {
        padding: 0,
        margin: '2em 5em 2em 5em',
        textAlign: 'center'
    };

    const { Header, Footer, Content } = Layout;
    return (
        <ProvideAuth onLogin={onLogin} onLogout={onLogout}>
            <Router>

                <Layout>
                    <Header style={headerStyle}>
                        <BlogNav onBlogUpdated={onBlogUpdated} />
                    </Header>
                    <Content style={contentStyle}>
                        <Routes>
                            <Route path='/'
                                   element={<BlogsList/>} />

                            <Route path='/login'
                                   element={<Welcome />} />

                            <Route path='/create-blog'
                                   element={<BlogCreate onBlogUpdated={onBlogUpdated} />} />

                            <Route path='/blogs'
                                   element={<BlogsList/>} />

                            <Route path='/blogs/:handle'
                                   element={<Entries />} />

                            <Route path='/blogs/:handle/settings'
                                   element={<BlogSettings onBlogUpdated={onBlogUpdated} />} />

                            <Route path='/blogs/:handle/drafts'
                                   element={<Drafts/>} />

                            <Route path='/blogs/:handle/edit'
                                   element={<EditorFormViaBlogHandle onBlogUpdated={onBlogUpdated} />} />

                            <Route path='/blogs/:handle/edit/:id'
                                   element={<EditorFormViaEntryId onBlogUpdated={onBlogUpdated}/>} />

                            <Route path='/blogs/:handle/entries/:id'
                                   element={<EntryView/>} />
                        </Routes>
                    </Content>
                    <Footer style={footerStyle}>
                        <Divider style={{fontSize: '10pt'}}>BlogQL Copyright Dave Johnson 2023</Divider>
                    </Footer>
                </Layout>

            </Router>
        </ProvideAuth>
    );
}

export default App;
