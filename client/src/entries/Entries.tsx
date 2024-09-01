/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {CSSProperties, useContext, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {ENTRIES_QUERY} from '../graphql/queries';
import {Heading} from "../common/Heading";
import {EntryEdge} from "../gql/graphql";
import {Avatar, Button, List, Space, Spin, Tooltip} from "antd";
import {stripHtml} from "string-strip-html";
import {RelativeDateTime, SimpleDateTime} from "../common/DateTime";
import {ClockCircleOutlined, EditOutlined, LinkOutlined} from "@ant-design/icons";
import {authContext, AuthContext} from "../common/Authentication";


function Entries() {
    const userContext: AuthContext = useContext(authContext);
    const {handle} = useParams<{ handle: string }>(); // get handle param from router route
    const [afterCursor, setAfterCursor] = useState<string | null>(null);
    const [beforeCursor, setBeforeCursor] = useState<string | null>(null);

    const PAGE_SIZE = 10;

    const { loading, error, data, fetchMore } = useQuery(ENTRIES_QUERY, {
        variables: {
            handle,
            first: PAGE_SIZE,
            after: afterCursor,
            before: beforeCursor,
        },
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Loading blogs..." />
            </div>
        );
    }

    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }

    const handleNextPage = () => {
        const endCursor = data?.blog?.entries?.pageInfo.endCursor;
        setAfterCursor(endCursor);
        setBeforeCursor(null);
        fetchMore({
            variables: { first: PAGE_SIZE, after: endCursor, before: null },
        });
    };

    const handlePreviousPage = () => {
        const startCursor = data?.blog?.entries?.pageInfo.startCursor;
        setBeforeCursor(startCursor);
        setAfterCursor(null);
        fetchMore({
            variables: { last: PAGE_SIZE, before: startCursor, after: null },
        });
    };

    const showIfLoggedIn = (): CSSProperties => {
        if (userContext.user?.id) {
            return {'display': 'block'};
        }
        return {'display': 'none'};
    };

    interface TruncateContentProps {
        content: string;
        link: string;
        truncateAt: number;
    }

    function TruncatedContent(props: TruncateContentProps) {
        const strippedContent = stripHtml(props.content).result;
        const truncatedContent = strippedContent.length > props.truncateAt
            ? strippedContent.substring(0, props.truncateAt) + '...' : strippedContent;
        return <>
                <span className='entry-card-content' dangerouslySetInnerHTML={{__html: truncatedContent}} />
            </>
    }

    const entries = data?.blog?.entries?.edges || [];
    const pageInfo = data?.blog?.entries?.pageInfo;

    return (
        <>
            <Heading title={data.blog.name} heading={'Tagline coming soon'}/>
            <List itemLayout='vertical'
                  dataSource={entries}
                  footer={<div></div>}
                  renderItem={(item: EntryEdge) => (
                      <List.Item
                          key={item.node.title}
                          actions={[
                              <Space>
                                  <Tooltip title="Link">
                                      <Link to={`/blogs/${data.blog.handle}/entries/${item.node.id}`}>
                                          <LinkOutlined />
                                      </Link>
                                  </Tooltip>
                                  <Tooltip title={ <>Published: <SimpleDateTime when={item.node.published}/></> }>
                                      <ClockCircleOutlined />
                                  </Tooltip>
                                  <Link style={showIfLoggedIn()}
                                        to={`/blogs/${data.blog.handle}/edit/${item.node.id}`}>
                                      <Tooltip title="Edit">
                                          <EditOutlined />
                                      </Tooltip>
                                  </Link>
                              </Space>
                          ]}
                          extra={
                              <img width={150} alt="logo" src="https://placekitten.com/150/100"/>
                      }>
                          <List.Item.Meta
                              avatar={<Avatar src={data.blog.user.picture}/>}
                              title={(
                                  <Link to={`/blogs/${data.blog.handle}/entries/${item.node.id}`}>
                                      {item.node.title}
                                  </Link>
                              )}
                              description={<i>Published <RelativeDateTime when={item.node.updated as Date}/></i>}
                          ></List.Item.Meta>
                          <TruncatedContent content={item.node.content} truncateAt={250}
                              link={`/blogs/${data.blog.handle}/entries/${item.node.id}`} />
                      </List.Item>
                  )}
            />

            <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handlePreviousPage} disabled={!pageInfo?.hasPreviousPage}>
                    Previous
                </Button>
                <Button onClick={handleNextPage} disabled={!pageInfo?.hasNextPage}>
                    Next
                </Button>
            </Space>

        </>
    );
}

export default Entries;
