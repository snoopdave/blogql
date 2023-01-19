/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import {Col, Nav, Navbar, Row} from 'react-bootstrap';
import './App.css';
import {EditorFormViaBlogHandle, EditorFormViaEntryId} from './entries/EntryEditor';
import Entries from './entries/Entries';
import Drafts from './entries/Drafts';
import {BrowserRouter as Router} from 'react-router-dom';
import {logout, ProvideAuth, useAuth, User} from './common/Authentication';
import {BlogList} from './blogs/BlogList';
import {useQuery} from '@apollo/client';
import {USER_BLOG_QUERY} from './graphql/queries';
import {BlogCreate} from './blogs/BlogCreate';
import {BlogSettings} from './blogs/BlogSettings';
import {Routes, Route} from "react-router";
import {Welcome} from "./Welcome";
import {LinkContainer} from 'react-router-bootstrap'

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
        // no op
    }

    return (
        <Container>
            <ProvideAuth onLogin={onLogin}>
                <Router>

                    <Row>
                        <Col>
                            <BlogNav/>
                        </Col>
                    </Row>

                    <Row>
                        <Col/>
                        <Col xs={10}>

                            <Routes>
                                <Route path='/'
                                       element={<BlogList/>} />

                                <Route path='/login'
                                       element={<Welcome onLogin={onLogin}/>} />

                                <Route path='/create-blog'
                                       element={<BlogCreate onBlogUpdated={onBlogUpdated}/>} />

                                <Route path='/blogs'
                                       element={<BlogList/>} />

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
                            </Routes>

                        </Col>
                        <Col/>
                    </Row>
                </Router>

            </ProvideAuth>
        </Container>
    );

    function BlogNav() {
        const auth = useAuth();

        const { loading, error, data } = useQuery(USER_BLOG_QUERY, {
            variables: {
                userId: auth?.user?.id ? auth?.user?.id : ''
            }
        });
        if (loading) {
            return (<p>Loading...</p>);
        }
        if (error) {
            return (<p>error!</p>);
        }
        if (!data) {
            return (<p>no data!</p>);
        }

        if (!error && data?.blogForUser) { // logged-in user with a blog (one blog per user for now)
            const handle: string = data.blogForUser.handle;
            return (

                <Navbar bg='light' expand='lg'>
                    <Container>
                        <Navbar.Brand href='/'>BlogQL</Navbar.Brand>
                        <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                        <Navbar.Collapse id='basic-navbar-nav'>
                            <Nav className='mr-auto'>
                                <LinkContainer to={`/blogs/${handle}`}>
                                    <Nav.Link className='nav-link' >Blog</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to={`/blogs/${handle}/drafts`}>
                                    <Nav.Link className='nav-link' >Drafts</Nav.Link>
                                </LinkContainer>
                                <LinkContainer  to={`/blogs/${handle}/settings`}>
                                    <Nav.Link className='nav-link'>Settings</Nav.Link>
                                </LinkContainer>
                                <Nav.Link className='nav-link' onClick={onLogout}>Logout</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>)

        } else if (auth?.user?.id) { // logged-in user without a blog
            return (

                <Navbar bg='light' expand='lg'>
                    <Container>
                        <Navbar.Brand href='/'>BlogQL</Navbar.Brand>
                        <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                        <Navbar.Collapse id='basic-navbar-nav'>
                            <Nav className='mr-auto'>
                                <LinkContainer to={'/create-blog'}>
                                    <Nav.Link className='nav-link'>Create a blog</Nav.Link>
                                </LinkContainer>
                                <Nav.Link className='nav-link' onClick={onLogout}>Logout</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>)

        } else { // not logged-in
            return (

                <Navbar bg='light' expand='lg'>
                    <Container>
                        <Navbar.Brand href='/'>BlogQL</Navbar.Brand>
                        <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                        <Navbar.Collapse id='basic-navbar-nav'>
                            <Nav className='mr-auto'>
                                <LinkContainer to={'/blogs'}>
                                    <Nav.Link className='nav-link'>Blogs</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to={'/login'}>
                                    <Nav.Link className='nav-link'>Login</Nav.Link>
                                </LinkContainer>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>)
        }
    }
}

export default App;
