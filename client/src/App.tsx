/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {CSSProperties, useState} from 'react';
import Container from 'react-bootstrap/Container';
import {Col, Jumbotron, Nav, Navbar, Row} from "react-bootstrap";
import "./App.css";
import {EditorForm, EditorFormViaId, EditorWelcome} from "./EntryEditor";
import EntryCardList from "./EntryCardList";
import EntryTable from "./EntryTable";
import {BrowserRouter as Router, Link, Redirect, Route} from 'react-router-dom';
import Switch from "react-bootstrap/Switch";
import dotenv from "dotenv";
import {LoginButton, logout, PrivateRoute, ProvideAuth, User} from "./Authentication";
import {BlogList} from "./BlogList";
import {useQuery} from "@apollo/client";
import {ENTRIES_QUERY, ENTRY_QUERY, USER_BLOG_QUERY} from "./graphql/queries";


function App() {

    dotenv.config();
    const [loggedIn, setLoggedIn] = useState(false);

    const onLogin = (user: User | null | undefined) => {
        localStorage.setItem('BlogQlUser', JSON.stringify(user));
        console.log(`onLogin: Set user ${user?.id} in context and localStorage`);
        setLoggedIn(true);
    };
    const onLogout = () => {
        logout(() => {
            setLoggedIn(false);
        });
    };
    const showIfLoggedIn = (): CSSProperties => {
        if (loggedIn) {
            return {['display' as any]: 'block'};
        }
        return {['display' as any]: 'none'};
    };
    const showIfNotLoggedIn = (): CSSProperties => {
        if (!loggedIn) {
            return {['display' as any]: 'block'};
        }
        return {['display' as any]: 'none'};
    };
    return (
        <>
            <Container>
                <ProvideAuth onLogin={onLogin}>
                    <Router forceRefresh={true}>

                        <Row>
                            <Col>
                                <BlogNav />
                            </Col>
                        </Row>

                        <Row>
                            <Col/>
                            <Col xs={10}>
                                <Switch>

                                    <Route exact path="/">
                                        <Redirect to={{pathname: "/blogs"}}/>
                                    </Route>

                                    <Route exact path="/logout">
                                        <Redirect to={{pathname: "/blogs"}}/>
                                    </Route>

                                    <Route exact path="/login">
                                        <Jumbotron>
                                            <h1>Welcome to BlogQL!</h1>
                                            <p>Please login via your favorite Google Account</p>
                                            <LoginButton onLogin={onLogin}/>
                                        </Jumbotron>
                                    </Route>

                                    <Route path="/blogs">
                                        <Jumbotron>
                                            <h1>BlogQL Blogs page</h1>
                                            <p>This is where you can find a list of all the blogs in the system.</p>
                                        </Jumbotron>
                                        <BlogList loggedIn={loggedIn}/>
                                    </Route>

                                    <Route path="/:handle/entries">
                                        <Jumbotron>
                                            <h1>BlogQL Entries page</h1>
                                            <p>This is where you can find your entries, whether they be blog posts,
                                                events, memories or what not.</p>
                                        </Jumbotron>
                                        <EntryCardList loggedIn={loggedIn}/>
                                    </Route>

                                    <PrivateRoute path="/:handle/table">
                                        <Jumbotron>
                                            <h1>BlogQL Entries table</h1>
                                            <p>This is where you can find your entries, whether they be blog posts,
                                                events, memories or what not.</p>
                                        </Jumbotron>
                                        <EntryTable/>
                                    </PrivateRoute>

                                    <PrivateRoute path="/:handle/edit/:id">
                                        <EditorWelcome/>
                                        <EditorFormViaId/>
                                    </PrivateRoute>

                                    <PrivateRoute exact path="/:handle/edit">
                                        <EditorWelcome/>
                                        <EditorForm id='' title='' content=''/>
                                    </PrivateRoute>

                                </Switch>
                            </Col>
                            <Col/>
                        </Row>

                    </Router>
                </ProvideAuth>
            </Container>
        </>
    );

    function BlogNav() {
        const { loading, error, data } = useQuery(USER_BLOG_QUERY);
        if (loading) {
            return (<img src='/loading-buffering.gif' alt='Loading...' />);
        }
        let handle = '';
        if (!error && data) {
            handle = data.blogForUser.handle;
        }

        console.log(`Handle=${handle}`);

        return (
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="/blogs">BlogQL</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Link style={showIfLoggedIn()} className="nav-link" to={`/${handle}/table`}>Table</Link>
                        <Link style={showIfLoggedIn()} className="nav-link" to={`/${handle}/edit`}>New Entry</Link>
                        <Navbar.Text style={showIfLoggedIn()}> <a href="/logout" onClick={onLogout}>Logout</a>
                            <Link className="nav-link" to="/blogs">Blogs</Link>
                            <Link style={showIfNotLoggedIn()} className="nav-link" to="/blogs">Blogs</Link>
                            <Link style={showIfNotLoggedIn()} className="nav-link" to="/login">Login</Link>
                        </Navbar.Text>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>)
    }
}

export default App;
