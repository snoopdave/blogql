/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Link, useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {ENTRY_QUERY} from '../graphql/queries';
import {Button, Jumbotron} from 'react-bootstrap';
import React, {CSSProperties} from 'react';
import {SimpleDateTime} from '../common/DateTime';

import './EntryView.css';

export interface EntryViewProps {
    loggedIn: boolean;
}

export function EntryView(props: EntryViewProps) {
    const { handle, id } = useParams<{handle : string, id: string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(ENTRY_QUERY, {
        variables: { handle, id }
    });

    const showIfLoggedIn = () : CSSProperties => {
        if (props.loggedIn) {
            return { 'display': 'block' };
        }
        return { 'display': 'none' };
    };

    if (loading) {
        return (<p>Loading...</p>);
    }
    if (error) {
        return (<p>error!</p>);
    }
    if (!data) {
        return (<p>no data!</p>);
    }

    return (
        <>
            <Jumbotron>
                <h1>{data.blog.name}</h1>
            </Jumbotron>
            <h2>{data.blog.entry.title}</h2>
            <p>
                <img className='profile-pic' src={data.blog.user.picture} alt={data.blog.user.username} />
                By {data.blog.user.username}
            </p>
            <hr />
            <div dangerouslySetInnerHTML={{__html: data.blog.entry.content}} />
            <p>
                <b>Author</b>: {data.blog.user.username} <br/>
                <b>Published</b>: <SimpleDateTime when={data.blog.entry.published as Date} />
            </p>
            <Link style={showIfLoggedIn()} to={`/blogs/${handle}/edit/${id}`}>
                <Button variant='primary'>Edit</Button>
            </Link>
        </>
    );
}