/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import {Col, Jumbotron, Nav, Navbar, Row} from 'react-bootstrap';
import './App.css';
import {EditorFormViaBlogHandle, EditorFormViaEntryId} from './EntryEditor';
import BlogView from './BlogView';
import Drafts from './Drafts';
import {BrowserRouter as Router, Link, Route} from 'react-router-dom';
import {LoginButton, logout, ProvideAuth, useAuth, User} from './Authentication';
import {BlogList} from './BlogList';
import {useQuery} from '@apollo/client';
import {USER_BLOG_QUERY} from './graphql/queries';
import {BlogCreate} from './BlogCreate';
import {BlogSettings} from './BlogSettings';
import {Routes} from "react-router";


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
                <Router forceRefresh={false}>

                    <Row>
                        <Col>
                            <BlogNav/>
                        </Col>
                    </Row>

                    <Row>
                        <Col/>
                        <Col xs={10}>

                            <Routes>

                                <Route path='/' element={<BlogList/>} >

                                    <Route path='blogs' children={<BlogList/>} />

                                    <Route path='login'>
                                        <Jumbotron>
                                            <h1>Welcome to BlogQL!</h1>
                                            <p>Please login via your favorite Google Account</p>
                                            <LoginButton onLogin={onLogin} destination='/blogs'/>
                                        </Jumbotron>
                                    </Route>

                                    <Route path='/create-blog'
                                        children={<BlogCreate onBlogUpdated={onBlogUpdated}/>} />

                                    <Route path='/blogs/:handle'
                                        children={<BlogView loggedIn={loggedIn}/>} />

                                    <Route path='/blogs/:handle/settings'
                                        children={<BlogSettings onBlogUpdated={onBlogUpdated}/>} />

                                    <Route path='/blogs/:handle/drafts'
                                        children={<Drafts/>} />

                                    <Route path='/blogs/:handle/edit'
                                        children={<EditorFormViaBlogHandle/>} />

                                    <Route path='/blogs/:handle/edit/:id'
                                        children={<EditorFormViaEntryId/>} />

                                </Route>

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
                                <Link className='nav-link' to={`/blogs/${handle}`}>Blog</Link>
                                <Link className='nav-link' to={`/blogs/${handle}/drafts`}>Drafts</Link>
                                <Link className='nav-link' to={`/blogs/${handle}/settings`}>Settings</Link>
                                <Link className='nav-link' onClick={onLogout} to={`/logout`}>Logout</Link>
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
                                <Link className='nav-link' to={'/create-blog'}>Create a blog</Link>
                                <Link className='nav-link' onClick={onLogout} to={`/logout`}>Logout</Link>
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
                                <Link className='nav-link' to={`/blogs`}>Blogs</Link>
                                <Link className='nav-link' to={'/login'}>Login</Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>)
        }
    }
}

export default App;
