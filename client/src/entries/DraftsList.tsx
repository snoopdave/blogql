/**
 * Copyright David M. Johnson (snoopdave@gmail.com).
 * Licensed under Apache Software License v2.
 */

import {Entry} from '../graphql/schema';
import {Link} from 'react-router-dom';
import {SimpleDateTime} from '../common/DateTime';
import React from 'react';
import {Table} from "antd";

interface DraftListProps {
    handle: string;
    drafts: Entry[];
}

function DraftsList(props: DraftListProps) {
    const dataSource: Entry[] = props.drafts;
    console.table(dataSource);
    const tableStyle: React.CSSProperties = {
        marginTop: '1em',
    };
    const columns = [
        { title:'Title', dataIndex:'title', key:'title', render: (_: any, entry: Entry) =>
            <Link className='nav-link' to={`/blogs/${props.handle}/edit/${entry.id}`}>{entry.title}</Link>
        },
        { title:'Updated', dataIndex:'updated', key:'updated', render: (_: any, entry: Entry) =>
            <span className='nav-link'><SimpleDateTime when={entry.updated}/></span>
        },
    ];
    return <Table style={tableStyle} dataSource={dataSource} columns={columns} />;
}

export default DraftsList;