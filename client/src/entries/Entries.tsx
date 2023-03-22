/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import React, {CSSProperties} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {ENTRIES_QUERY} from '../graphql/queries';
import {Heading} from "../common/Heading";
import {Entry} from "../graphql/schema";
import {Avatar, Button, List, Space, Tooltip} from "antd";
import {stripHtml} from "string-strip-html";
import {RelativeDateTime, SimpleDateTime} from "../common/DateTime";
import {ClockCircleOutlined, EditOutlined, LinkOutlined} from "@ant-design/icons";

export interface BlogViewProps {
    loggedIn: boolean;
}

function Entries(props: BlogViewProps) {
    const {handle} = useParams<{ handle: string }>(); // get handle param from router route
    const {loading, error, data} = useQuery(ENTRIES_QUERY, {
        variables: {handle, limit: 50} // TODO: pagination!
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

    const showIfLoggedIn = (): CSSProperties => {
        if (props.loggedIn) {
            return {'display': 'block'};
        }
        return {'display': 'none'};
    };

    interface TruncateContentProps {
        content: string;
        link: string;
    }

    function TruncatedContent(props: TruncateContentProps) {
        const strippedContent = stripHtml(props.content).result;
        const truncatedContent = strippedContent.length > 150
            ? strippedContent.substring(0, 150) + '...' : strippedContent;
        return <>
                <span className='entry-card-content' dangerouslySetInnerHTML={{__html: truncatedContent}} />
            </>
    }

    return (
        <>
            <Heading title={data.blog.name} heading={'Tagline coming soon'}/>
            <List itemLayout='vertical'
                  dataSource={data.blog.entries?.nodes}
                  footer={<div></div>}
                  renderItem={(item: Entry) => (
                      <List.Item
                          key={item.title}
                          actions={[
                              <Space>
                                  <Tooltip title="Link">
                                      <Link to={`/blogs/${data.blog.handle}/entries/${item.id}`}>
                                          <LinkOutlined />
                                      </Link>
                                  </Tooltip>
                                  <Link style={showIfLoggedIn()}
                                        to={`/blogs/${data.blog.handle}/edit/${item.id}`}>
                                      <Tooltip title="Edit">
                                          <EditOutlined />
                                      </Tooltip>
                                  </Link>
                                  <Tooltip title={ <>Published: <SimpleDateTime when={item.published}/></> }>
                                      <ClockCircleOutlined />
                                  </Tooltip>
                              </Space>
                          ]}
                          extra={
                              <img width={150} alt="logo" src="https://placekitten.com/150/100"/>
                      }>
                          <List.Item.Meta
                              avatar={<Avatar src={data.blog.user.picture}/>}
                              title={(
                                  <Link to={`/blogs/${data.blog.handle}/entries/${item.id}`}>
                                      {item.title}
                                  </Link>
                              )}
                              description={<i>Published <RelativeDateTime when={item.updated as Date}/></i>}
                          ></List.Item.Meta>
                          <TruncatedContent content={item.content}
                              link={`/blogs/${data.blog.handle}/entries/${item.id}`} />
                      </List.Item>
                  )}
            />
        </>
    );
}

export default Entries;
