/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useEffect} from 'react';
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {DRAFTS_QUERY} from '../graphql/queries';
import {useParams} from 'react-router-dom';
import DraftsList from './DraftsList';
import {RequireAuth} from '../common/Authentication';
import {useNavigate} from 'react-router';
import {Button} from "antd";
import {Heading} from "../common/Heading";


function Drafts() {
    const navigate = useNavigate();
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(DRAFTS_QUERY, { variables: { handle, limit: 50 } });

    useEffect(() => {
        console.log("useEffect called for Drafts");
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
        navigate(`/blogs/${handle}/edit`);
    }

    return <RequireAuth redirectTo='/login'>
        <Heading title='Drafts'
                 heading='This is where you find your unpublished draft blog entries, and create new ones.' />
        <Button onClick={() => { newEntry(); }}>New</Button>
        <DraftsList handle={handle!} drafts={data.blog?.drafts?.nodes}/>
    </RequireAuth>;
}

export default Drafts;
