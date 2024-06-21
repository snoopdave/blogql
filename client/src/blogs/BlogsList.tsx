/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {BLOGS_QUERY} from '../graphql/queries';
import React, {useState} from 'react';
import {Heading} from "../common/Heading";
import {Table} from "antd";
import {BlogEdge} from "../gql/graphql";
import {Link} from "react-router-dom";


export function BlogsList() {
    const [fixedTop, setFixedTop] = useState(false);
    const pageSize = 10;
    const { loading, error, data } = useQuery(BLOGS_QUERY, { variables: { first: pageSize }} );
    if (loading) { return (<p>Loading...</p>); }
    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name',
            render: (_: string, edge: BlogEdge) => <Link to={`/blogs/${edge.node.handle}`}>{edge.node.name}</Link>
        },
        { title: 'Handle', dataIndex: 'handle', key: 'handle',
            render: (_: string, edge: BlogEdge) => <Link to={`/blogs/${edge.node.handle}`}>{edge.node.handle}</Link>
        },
    ];

    const dataSource = data.blogs?.edges;
    return (
        <>
            <Heading title='Welcome to BlogQL'
                     heading='This is where you can find a list of all the blogs in the system.' />
            <Table
                rowKey={(record) => record.node.id} // Ensure each row has a unique key
                loading={loading}
                dataSource={dataSource}
                columns={columns}
                pagination={{
                    pageSize: pageSize,
                    onChange: e => {
                }
            }} />
        </>
    );
}