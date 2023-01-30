/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {useAuth} from './common/Authentication';
import {useQuery} from '@apollo/client';
import {USER_BLOG_QUERY} from './graphql/queries';
import {Nav, Navbar} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import {LinkContainer} from 'react-router-bootstrap';
import React from 'react';

interface BlogNavProps {
    onLogout: () => void;
}

export function BlogNav(props: BlogNavProps) {
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
                            <Nav.Link className='nav-link' onClick={props.onLogout}>Logout</Nav.Link>
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
                            <Nav.Link className='nav-link' onClick={props.onLogout}>Logout</Nav.Link>
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