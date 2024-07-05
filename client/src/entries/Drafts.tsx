/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {useState} from 'react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const { handle } = useParams<{handle : string}>(); // get handle param from router route
    const [afterCursor, setAfterCursor] = useState<string | null>(null);
    const [beforeCursor, setBeforeCursor] = useState<string | null>(null);

    const PAGE_SIZE = 10;

    const { loading, error, data, fetchMore } = useQuery(DRAFTS_QUERY, {
        variables: {
            handle,
            first: PAGE_SIZE,
            after: afterCursor,
            before: beforeCursor,
        },
    });

    if (loading) { return (<p>Loading...</p>); }
    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }

    function newEntry() {
        navigate(`/blogs/${handle}/edit`);
    }

    const handleTableChange = async (pagination: any) => {
        const { current } = pagination;

        if (current > currentPage) {
            // Next page
            const endCursor = data?.blog?.drafts?.pageInfo.endCursor;
            setAfterCursor(endCursor || null);
            setBeforeCursor(null);
        } else if (current < currentPage) {
            // Previous page
            const startCursor = data?.blog?.drafts?.pageInfo.startCursor;
            setBeforeCursor(startCursor || null);
            setAfterCursor(null);
        }

        setCurrentPage(current);

        await fetchMore({
            variables: {
                first: current > currentPage ? PAGE_SIZE : undefined,
                last: current < currentPage ? PAGE_SIZE : undefined,
                after: current > currentPage ? data?.blog?.drafts?.pageInfo.endCursor : undefined,
                before: current < currentPage ? data?.blog?.drafts?.pageInfo.startCursor : undefined,
            },
            updateQuery: (prevResult, { fetchMoreResult }) => {
                return fetchMoreResult || prevResult;
            },
        });
    };

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

    return (
        <RequireAuth redirectTo="/login">
            <Heading title="Drafts"
                     heading='This is where you find your unpublished draft blog entries, and create new ones.' />
            <Button onClick={() => { newEntry(); }}>New</Button>
            <Table
                style={tableStyle}
                loading={loading}
                columns={columns}
                dataSource={data?.blog?.drafts?.edges || []}
                rowKey={(record) => record.node.id}
                pagination={{
                    current: currentPage,
                    pageSize: PAGE_SIZE,
                    total: data?.blog?.drafts?.pageInfo.totalCount,
                    showSizeChanger: false,
                }}
                onChange={handleTableChange}
            />
        </RequireAuth>
    );

}

export default Drafts;
