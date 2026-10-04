/*
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Link, useParams} from 'react-router-dom';
import {useQuery} from '@apollo/client/react/hooks/useQuery';
import {ENTRY_QUERY} from '../graphql/queries';
import React, {CSSProperties, useContext} from 'react';
import {RelativeDateTime, SimpleDateTime} from '../common/DateTime';

import './EntryView.css';
import {Space, Tooltip} from "antd";
import {authContext, AuthContext} from "../common/Authentication";
import {ClockCircleOutlined, EditOutlined, LinkOutlined} from "@ant-design/icons";

export interface EntryViewProps {
}

export function EntryView(props: EntryViewProps) {
    const userContext: AuthContext = useContext(authContext);
    const { handle, id } = useParams<{handle : string, id: string}>(); // get handle param from router route
    const { loading, error, data } = useQuery(ENTRY_QUERY, {
        variables: { handle, id }
    });

    const showIfLoggedIn = () : CSSProperties => {
        if (userContext.user?.id) {
            return { 'display': 'block' };
        }
        return { 'display': 'none' };
    };
    if (loading) { return (<p>Loading...</p>); }
    if (error) { return (<p>error!</p>); }
    if (!data) { return (<p>no data!</p>); }

    return (
        <article className="entry-view">
            <header className="entry-header">
                <Link className="entry-blog-name" to={`/blogs/${data.blog.handle}`}>{data.blog.name}</Link>
                <h1>{data.blog.entry.title}</h1>
                <p className="entry-meta">By {data.blog.user.username} · Published <RelativeDateTime when={data.blog.entry.published as Date}/></p>
            </header>
            <div className="entry-body" dangerouslySetInnerHTML={{__html: data.blog.entry.content}} />
            <footer className="entry-footer">
                <p><b>Author</b>: {data.blog.user.username}</p>
                <p><b>Published</b>: <SimpleDateTime when={data.blog.entry.published as Date} /></p>
                <Space>
                    <Tooltip title="Link">
                        <Link aria-label="Permalink" to={`/blogs/${data.blog.handle}/entries/${data.blog.entry.id}`}>
                            <LinkOutlined />
                        </Link>
                    </Tooltip>
                    <Tooltip title={ <>Published: <SimpleDateTime when={data.blog.entry.published}/></> }>
                        <ClockCircleOutlined />
                    </Tooltip>
                    <Link aria-label="Edit entry" style={showIfLoggedIn()}
                          to={`/blogs/${data.blog.handle}/edit/${data.blog.entry.id}`}>
                        <Tooltip title="Edit">
                            <EditOutlined />
                        </Tooltip>
                    </Link>
                </Space>
            </footer>
        </article>
    );
}
