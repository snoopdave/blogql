/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from 'react';
import {Button, Form, Jumbotron} from "react-bootstrap";
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {DRAFTS_QUERY} from "./graphql/queries";
import {useHistory, useParams} from "react-router-dom";
import DraftList from "./DraftList";
import {RequireAuth} from "./Authentication";


function Drafts() {
    const history = useHistory();
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(DRAFTS_QUERY, {
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

    return <RequireAuth redirectTo="/login">
            <Jumbotron>
                <h1>Drafts</h1>
                <p>This is where you find your unpublished draft blog entries.</p>
            </Jumbotron>
            <Form>
                <Form.Group>
                    <Button onClick={() => { newEntry(); }}>New</Button>
                </Form.Group>
            </Form>
            <DraftList handle={handle!} drafts={data.blog?.drafts?.nodes}/>
        </RequireAuth>;
}

export default Drafts;
