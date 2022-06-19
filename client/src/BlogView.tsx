/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {CSSProperties} from 'react';
import {Button, Card, CardColumns} from 'react-bootstrap';
import {Link, useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client';
import {ENTRIES_QUERY} from './graphql/queries';
import {DateTime, DateTimeProps} from "./DateTime";


export interface BlogViewProps {
    loggedIn: boolean;
}

function BlogView(props: BlogViewProps) {

    // TODO: query to get only PUBLISHED entries here

    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(ENTRIES_QUERY, {
        variables: { handle, limit: 50 } // TODO: pagination!
    });

    if (loading) {
        return (<img src='/loading-buffering.gif' alt='Loading...' />);
    }
    if (error) {
        return (<p>error!</p>);
    }
    if (!data) {
        return (<p>no data!</p>);
    }
    //console.log('GOT DATA: ' + JSON.stringify(data, null, 4));

    const showIfLoggedIn = () : CSSProperties => {
        if (props.loggedIn) {
            return { ['display' as any]: 'block' };
        }
        return { ['display' as any]: 'none' };
    };

    // TODO: need to truncate long entry titles and content with ellipsis...
    // TODO: show in reverse chrono order
    // TODO: show date of each entry
    // TODO: show a generic document icon
    return (
        <CardColumns> {
            data.blog.entries?.nodes.map((entry) => entry ? (
                <Card style={{width: '18em'}} key={entry.id}>
                    <Card.Img variant='top' src={`https://picsum.photos/seed/picsum/215/160?random=${entry.id}`} />
                    <Card.Body>
                        <Card.Title>{entry.title}</Card.Title>
                        <Card.Body>
                            <div dangerouslySetInnerHTML={{__html: entry.content}}/>
                            <DateTime updated={entry.updated as Date} />
                        </Card.Body>
                        <Link style={showIfLoggedIn()} to={`/blogs/${handle}/edit/${entry.id}`}>
                            <Button variant='primary'>Edit</Button>
                        </Link>
                    </Card.Body>
                </Card>
            ) : null)
        }
        </CardColumns>
    );
}

export default BlogView;
