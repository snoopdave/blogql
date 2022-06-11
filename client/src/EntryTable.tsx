/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from 'react';
import {Table} from "react-bootstrap";
import ErrorBoundary from "./ErrorBoundary";
import {useQuery} from "@apollo/client";
import {ENTRIES_QUERY} from "./graphql/queries";


function EntryTable() {
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

    // TODO: need to truncate long entry titles and content with ellipsis...
    // TODO: show in reverse chrono order
    // TODO: show date of each entry
    // TODO: show a generic document icon
    return (
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>Title</th>
                <th>Created</th>
            </tr>
            </thead>
            <tbody>{ data.entries?.nodes.map((entry) => entry ? (
                <tr key={entry.id}>
                    <td>{entry.title}</td>
                    <td>TODO</td>
                </tr> ) : null)
            }</tbody>
        </Table>
    );
}

export default EntryTable;
