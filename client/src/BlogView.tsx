/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {CSSProperties} from 'react';
import {Button, Card, CardColumns} from "react-bootstrap";
import {Link} from "react-router-dom";
import {useQuery} from "@apollo/client";
import {ENTRIES_QUERY} from "./graphql/queries";


export interface EntryCardListProps {
    loggedIn: boolean;
}

function BlogView(props: EntryCardListProps) {
    const { loading, error, data } = useQuery(ENTRIES_QUERY);

    if (loading) {
        return (<img src='/loading-buffering.gif' alt='Loading...' />);
    }
    if (error) {
        return (<p>error!</p>);
    }
    if (!data) {
        return (<p>no data!</p>);
    }
    //console.log("GOT DATA: " + JSON.stringify(data, null, 4));

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
            data.entries?.nodes.map((entry) => entry ? (
                <Card style={{width: '18em'}} key={entry.id}>
                    <Card.Img variant="top" src={`https://picsum.photos/seed/picsum/215/160?random=${entry.id}`} />
                    <Card.Body>
                        <Card.Title>{entry.title}</Card.Title>
                        <Card.Body>
                            <div dangerouslySetInnerHTML={{__html: entry.content}}/>
                            <DateTime updated={entry.updated as Date} />
                        </Card.Body>
                        <Link style={showIfLoggedIn()} to={`/edit/${entry.id}`}>
                            <Button variant="primary">Edit</Button>
                        </Link>
                    </Card.Body>
                </Card>
            ) : null)
        }
        </CardColumns>
    );
}

type DateTimeProps = {
    updated: Date,
}

function DateTime(props: DateTimeProps) {
    let updated = new Date(props.updated).getTime();
    let span = Date.now() - updated;
    let daysAgo = -1 * Math.round(span / (24 * 60 * 60 * 1000));
    //console.log(`Updated = ${updated} span = ${span} daysAgo = ${daysAgo}`);
    let rtf = new Intl.RelativeTimeFormat('en-US', { style: 'long', numeric: 'auto' });
    return <span>{rtf.format(daysAgo, "day")}</span>;
}

export default BlogView;
