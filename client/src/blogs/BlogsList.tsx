/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {BLOGS_QUERY} from '../graphql/queries';
import React from 'react';
import {Heading} from "../common/Heading";
import {Table} from "antd";


export function BlogsList() {
    const { loading, error, data } = useQuery(BLOGS_QUERY);
    if (loading) {
        console.log('BlogsList: Loading...');
        return (<p>Loading...</p>);
    }
    if (error) {
        console.log('BlogsList: Error');
        return (<p>error!</p>);
    }
    if (!data) {
        console.log('BlogsList: No data');
        return (<p>no data!</p>);
    }
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'id' },
        { title: 'Handle', dataIndex: 'handle', key: 'id', render: (text: string) => <a href={`/blogs/${text}`}>{text}</a> },
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