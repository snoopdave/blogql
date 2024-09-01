/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {BLOGS_QUERY} from '../graphql/queries';
import React, {useState} from 'react';
import {Heading} from "../common/Heading";
import {Button, Spin, Table} from "antd";
import {Link} from "react-router-dom";
import {BlogEdge} from "../gql/graphql";


export function BlogsList() {
    const [currentPage, setCurrentPage] = useState(1);
    const [afterCursor, setAfterCursor] = useState<string | null>(null);
    const [beforeCursor, setBeforeCursor] = useState<string | null>(null);
    const PAGE_SIZE = 10;

    const { loading, error, data, fetchMore } = useQuery(
        BLOGS_QUERY,
        {
            variables: {
                first: PAGE_SIZE,
                after: afterCursor,
                last: PAGE_SIZE,
                before: beforeCursor,
            },
        }
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Loading blogs..." />
            </div>
        );
    }

    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }

    const handleTableChange = async (pagination: any) => {
        const { current } = pagination;
        const isNextPage = current > currentPage;

        await fetchMore({
            variables: {
                first: isNextPage ? PAGE_SIZE : null,
                after: isNextPage ? data?.blogs?.pageInfo.endCursor : null,
                last: !isNextPage ? PAGE_SIZE : null,
                before: !isNextPage ? data?.blogs?.pageInfo.startCursor : null,
            },
            updateQuery: (prevResult, { fetchMoreResult }) => {
                if (!fetchMoreResult) return prevResult;
                return fetchMoreResult;
            },
        });

        setCurrentPage(current);
        if (isNextPage) {
            setAfterCursor(data?.blogs?.pageInfo.endCursor);
            setBeforeCursor(null);
        } else {
            setBeforeCursor(data?.blogs?.pageInfo.startCursor);
            setAfterCursor(null);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_: string, edge: BlogEdge) => <Link to={`/blogs/${edge.node.handle}`}>{edge.node.name}</Link>,
        },
        {
            title: 'Handle',
            dataIndex: 'handle',
            key: 'handle',
            render: (_: string, edge: BlogEdge) => <Link to={`/blogs/${edge.node.handle}`}>{edge.node.handle}</Link>,
        },
    ];

    const dataSource = data.blogs?.edges;
    return (
        <>
            <Heading title="Welcome to BlogQL" heading="This is where you can find a list of all the blogs in the system." />
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                rowKey={(record) => record.node.id}
                pagination={{
                    current: currentPage,
                    pageSize: PAGE_SIZE,
                    total: data?.blogs?.pageInfo.totalCount,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    itemRender: (_, type, originalElement) => {
                        if (type === 'prev') {
                            return <Button type="primary" disabled={!data?.blogs?.pageInfo.hasPreviousPage}>Previous</Button>;
                        }
                        if (type === 'next') {
                            return <Button type="primary" disabled={!data?.blogs?.pageInfo.hasNextPage}>Next</Button>;
                        }
                        return null; // This will hide page numbers
                    },
                }}
                onChange={handleTableChange}
            />
        </>
    );
}