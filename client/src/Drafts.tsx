/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from 'react';
import {Button, Form, Table} from "react-bootstrap";
import {useQuery} from "@apollo/client";
import {ENTRIES_QUERY} from "./graphql/queries";
import {Link, useHistory, useParams} from "react-router-dom";


function Drafts() {
    const history = useHistory();
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(ENTRIES_QUERY, {
        variables: { handle, limit: 50 }
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

    function newEntry() {
        history.push(`/blogs/${handle}/edit`);
    }

    return (
        <>
            <Form>
                <Form.Group>
                    <Button onClick={() => {
                        newEntry();
                    }}>New</Button>
                </Form.Group>
            </Form>

            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Title</th>
                    <th>Created</th>
                </tr>
                </thead>
                <tbody>{ data.blog?.entries?.nodes.map((entry) => entry ? (
                    <tr key={entry.id}>
                        <td><Link className='nav-link' to={`/blogs/${handle}/edit/${entry.id}`}>{entry.title}</Link></td>
                        <td><Link className='nav-link' to={`/blogs/${handle}/edit/${entry.id}`}>TODO</Link></td>
                    </tr> ) : null)
                }</tbody>
            </Table>
        </>

    );
}

export default Drafts;
