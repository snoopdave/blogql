/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from 'react';
import {Jumbotron} from 'react-bootstrap';
import {useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {ENTRIES_QUERY} from './graphql/queries';
import BlogColumns from "./BlogColumns";


export interface BlogViewProps {
    loggedIn: boolean;
}

function BlogView(props: BlogViewProps) {
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(ENTRIES_QUERY, {
        variables: { handle, limit: 50 } // TODO: pagination!
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

    return (
        <>
            <Jumbotron>
            <h1>{data.blog.name}</h1>
            </Jumbotron>
            <BlogColumns handle={handle} loggedIn={props.loggedIn} entries={data.blog.entries?.nodes} />
        </>
    );
}

export default BlogView;
