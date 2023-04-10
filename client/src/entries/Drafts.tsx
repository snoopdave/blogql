/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React from 'react';
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {DRAFTS_QUERY} from '../graphql/queries';
import {Link, useParams} from 'react-router-dom';
import {RequireAuth} from '../common/Authentication';
import {useNavigate} from 'react-router';
import {Button, Table} from "antd";
import {Heading} from "../common/Heading";
import {EntryEdge} from "../gql/graphql";
import {SimpleDateTime} from "../common/DateTime";


function Drafts() {
    const navigate = useNavigate();
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(DRAFTS_QUERY, { variables: { handle } });
    if (loading) { return (<p>Loading...</p>); }
    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }

    function newEntry() {
        navigate(`/blogs/${handle}/edit`);
    }

    const columns = [
        { title:'Title', dataIndex:'title', key:'title', render: (_: any, edge: EntryEdge) =>
                <Link className='nav-link' to={`/blogs/${handle}/edit/${edge.node.id}`}>
                    {edge.node.title}
                </Link>
        },
        { title:'Updated', dataIndex:'updated', key:'updated', render: (_: any, edge: EntryEdge) =>
                <span className='nav-link'><SimpleDateTime when={edge.node.updated}/></span>
        },
    ];

    const tableStyle: React.CSSProperties = {
        marginTop: '1em',
    };

    console.log('Drafts: rendering');

    return <RequireAuth redirectTo='/login'>
        <Heading title='Drafts'
            heading='This is where you find your unpublished draft blog entries, and create new ones.' />
        <Button onClick={() => { newEntry(); }}>New</Button>
        <Table style={tableStyle} dataSource={data.blog?.drafts?.edges} columns={columns} />
    </RequireAuth>
}

export default Drafts;
