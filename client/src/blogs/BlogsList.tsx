/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {BLOGS_QUERY} from '../graphql/queries';
import React from 'react';
import {Heading} from "../common/Heading";
import {Table} from "antd";
import {Blog} from "../graphql/schema";
import {Link} from "react-router-dom";


export function BlogsList() {
    const { loading, error, data } = useQuery(BLOGS_QUERY);
    if (loading) { return (<p>Loading...</p>); }
    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'id',
            render: (_: string, blog: Blog) => <Link to={`/blogs/${blog.handle}`}>{blog.name}</Link>
        },
        { title: 'Handle', dataIndex: 'handle', key: 'id',
            render: (text: string) => <Link to={`/blogs/${text}`}>{text}</Link>
        },
    ];
    const dataSource = data.blogs?.nodes;
    return (
        <>
            <Heading title='Welcome to BlogQL'
                     heading='This is where you can find a list of all the blogs in the system' />
            <Table dataSource={dataSource} columns={columns} />
        </>
    );
}